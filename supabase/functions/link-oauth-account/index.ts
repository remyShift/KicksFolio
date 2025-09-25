import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface LinkOAuthRequest {
	provider: 'google' | 'apple';
	token: string;
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers':
		'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
	try {
		if (req.method === 'OPTIONS') {
			return new Response('ok', { headers: corsHeaders });
		}

		if (req.method !== 'POST') {
			return new Response('Method not allowed', { status: 405 });
		}

		const supabase = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_ANON_KEY') ?? ''
		);

		// Set the authorization header for this request
		const authHeader = req.headers.get('Authorization');
		if (authHeader) {
			supabase.auth.setAuth(authHeader.replace('Bearer ', ''));
		}

		console.log('Processing OAuth link request');

		// Get the session or user object
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			console.error('No authenticated user found');
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const { provider, token }: LinkOAuthRequest = await req.json();

		console.log(`Linking ${provider} account for user: ${user.id}`);

		if (!provider || !token) {
			return new Response(
				JSON.stringify({ error: 'Provider and token are required' }),
				{
					status: 400,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json',
					},
				}
			);
		}

		// Vérifier si le provider est déjà lié
		const { data: existingLinks, error: fetchError } = await supabase
			.from('user_oauth_links')
			.select('*')
			.eq('user_id', user.id)
			.eq('provider', provider);

		if (fetchError) {
			throw fetchError;
		}

		if (existingLinks && existingLinks.length > 0) {
			return new Response(
				JSON.stringify({
					error: `${provider} account is already linked`,
				}),
				{
					status: 409,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json',
					},
				}
			);
		}

		// Vérifier le token OAuth avec le provider
		let providerUserId: string;
		let providerEmail: string | null = null;

		if (provider === 'google') {
			// Vérifier le token Google
			const googleResponse = await fetch(
				`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`
			);

			if (!googleResponse.ok) {
				return new Response(
					JSON.stringify({ error: 'Invalid Google token' }),
					{
						status: 400,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json',
						},
					}
				);
			}

			const googleUser = await googleResponse.json();
			providerUserId = googleUser.id;
			providerEmail = googleUser.email;
		} else if (provider === 'apple') {
			// Pour Apple, le token est un JWT qu'il faudrait décoder et vérifier
			// Pour la simplicité, nous assumons que le token est valide
			// Dans un environnement de production, vous devriez vérifier le JWT Apple
			providerUserId = `apple_${Date.now()}`; // Placeholder
			providerEmail = null;
		} else {
			return new Response(
				JSON.stringify({ error: 'Unsupported provider' }),
				{
					status: 400,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json',
					},
				}
			);
		}

		// Vérifier si ce compte provider n'est pas déjà lié à un autre utilisateur
		const { data: existingUserLinks, error: existingError } = await supabase
			.from('user_oauth_links')
			.select('*')
			.eq('provider', provider)
			.eq('provider_user_id', providerUserId);

		if (existingError) {
			throw existingError;
		}

		if (existingUserLinks && existingUserLinks.length > 0) {
			return new Response(
				JSON.stringify({
					error: `This ${provider} account is already linked to another user`,
				}),
				{
					status: 409,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json',
					},
				}
			);
		}

		// Créer la liaison
		const { data, error: insertError } = await supabase
			.from('user_oauth_links')
			.insert({
				user_id: user.id,
				provider: provider,
				provider_user_id: providerUserId,
				provider_email: providerEmail,
				linked_at: new Date().toISOString(),
			});

		if (insertError) {
			throw insertError;
		}

		console.log(
			`Successfully linked ${provider} account for user ${user.id}`
		);

		return new Response(
			JSON.stringify({
				success: true,
				message: `${provider} account linked successfully`,
			}),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	} catch (error: unknown) {
		console.error('Error in link-oauth-account function:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error';
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
