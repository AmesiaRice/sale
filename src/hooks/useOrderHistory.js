import useSWR from "swr";

 async function fetchOrderHistory({ retailerId, orderId }) {
    const params = new URLSearchParams();
    if(retailerId) params.set("retailerId", retailerId);
    if(orderId) params.set("orderId", orderId);

    const res = await fetch(`/api/order-history?${params.toString()}`);
    const data = await res.json();

    if(!data){
        throw new Error("No data received from the server");
    }
     return data.orders || [];
 };

 export function useOrderHistory({ retailerId, orderId }) {
    const swrKEY =
   orderId ? ["order-history", "search", orderId] 
   : retailerId ? ["order-history", "retailer", retailerId]
   : null;

   const {data,error,isLoading,mutate} = useSWR(
     swrKEY,
     () => fetchOrderHistory({ retailerId, orderId }),
     {
         revalidateOnFocus: false,
         // Order status (jaise Cancelled) admin se update ho sakta hai — retailer
         // ko bina manual refresh kiye pata chalna chahiye
         refreshInterval: 30000,
     }
   )
   return {
    orders:data,
    isLoading,
    error,
    refresh: mutate
   }
 };