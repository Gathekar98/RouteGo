import { QueryClient , QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from '../store/store';

const queryClient = new QueryClient({
    defaultOptions: {
        queries:{
            staleTime: 1000 * 6, //1 minute - data is "fresh" for this long, no refetech
            retry: 1,
        },
    },
});

export function AppProviders({children}:{children: ReactNode}){
    return(
        <BrowserRouter>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Provider>
        </BrowserRouter>
    );
}