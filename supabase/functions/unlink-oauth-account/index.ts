import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface UnlinkOAuthRequest {
	provider: 'google' | 'apple';
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
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
		);

		// Get the authorization header to identify the user
		const authHeader = req.headers.get('Authorization');
		if (!authHeader) {
			console.error('No authorization header found');
			return new Response(
				JSON.stringify({ error: 'Authorization header required' }),
				{
					status: 401,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json',
					},
				}
			);
		}

		console.log('Processing OAuth unlink request');

		// Extract the JWT token from the Authorization header
		const jwtToken = authHeader.replace('Bearer ', '');

		// Get the user from the JWT token using service role
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser(jwtToken);

		if (userError || !user) {
			console.error('Failed to authenticate user:', userError);
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const { provider }: UnlinkOAuthRequest = await req.json();

		console.log(`Unlinking ${provider} account for user: ${user.id}`);

		if (!provider) {
			return new Response(
				JSON.stringify({ error: 'Provider is required' }),
				{
					status: 400,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json',
					},
				}
			);
		}

		// Vérifier si le provider est lié
		const { data: existingLinks, error: fetchError } = await supabase
			.from('user_oauth_links')
			.select('*')
			.eq('user_id', user.id)
			.eq('provider', provider);

		if (fetchError) {
			throw fetchError;
		}

		if (!existingLinks || existingLinks.length === 0) {
			return new Response(
				JSON.stringify({ error: `${provider} account is not linked` }),
				{
					status: 404,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json',
					},
				}
			);
		}

		// Supprimer la liaison
		const { error: deleteError } = await supabase
			.from('user_oauth_links')
			.delete()
			.eq('user_id', user.id)
			.eq('provider', provider);

		if (deleteError) {
			throw deleteError;
		}

		console.log(
			`Successfully unlinked ${provider} account for user ${user.id}`
		);

		return new Response(
			JSON.stringify({
				success: true,
				message: `${provider} account unlinked successfully`,
			}),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	} catch (error: unknown) {
		console.error('Error in unlink-oauth-account function:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error';
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
