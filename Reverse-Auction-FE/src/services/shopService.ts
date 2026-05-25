import type { ShopDetail } from "@/types/shopDetail.ts";
import api from "@/utils/axios";
import type {Product} from "@/types/product.ts";

export const shopService = {
    getShopDetail: async (sellerId: string | number): Promise<ShopDetail> => {
        const res = await api.get(`/shop/detail/${sellerId}`);
        console.log(res.data);
        return res.data;
    },
    getShopProducts: async (sellerId: string | number): Promise<Product[]> => {
        const res = await api.get(`/shop/${sellerId}/products`);
        console.log(res.data);
        return res.data;
    },
    getListShops: async (): Promise<ShopDetail[]> => {
        const res = await api.get("/shop/list");
        return res.data;
    },
};