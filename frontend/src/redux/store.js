
import { configureStore } from "@reduxjs/toolkit";

import deviationReducer from "./deviationSlice";
import capaReducer from "./capaSlice";

export const store = configureStore({
  reducer: {
    deviations: deviationReducer,
    capa: capaReducer
  }
});
