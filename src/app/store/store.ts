import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
    reducer: {
        //slices will be added here (booking draft)
    },
});

// Types inferred from the store itself — this is the Redux Toolkit
// recommended pattern so useSelector/useDispatch stay fully typed.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;