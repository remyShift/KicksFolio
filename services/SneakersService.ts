import { Sneaker } from "@/types/Sneaker";
import { addSneaker } from "@/scripts/handleSneakers/addSneaker";
import { deleteSneaker } from "@/scripts/handleSneakers/deleteSneaker";
import { skuLookUp } from "@/scripts/handleSneakers/skuLookUp";

export class HandleSneakers {
    private userId: string;
    private sessionToken: string;

    constructor(userId: string, sessionToken: string) {
        this.userId = userId;
        this.sessionToken = sessionToken;
    }

    public async add(sneaker: Sneaker, sneakerId?: string) {
        return addSneaker(sneaker, sneakerId || "", this.sessionToken, this.userId)
            .then(response => {
                return response;
            });
    }

    public async delete(sneakerId: string) {
        return deleteSneaker(sneakerId, this.userId, this.sessionToken)
            .then(response => {
                return response;
            });
    }

    public async searchBySku(sku: string) {
        return skuLookUp(sku, this.sessionToken)
            .then(response => {
                return response;
            });
    }
}