import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const name = "auth";
const initialState = createInitialState();

const slice = createSlice({
  name,
  initialState,
  reducers: {
    setAuth(state, action) {
      state.value = action.payload;
      Cookies.set("user", JSON.stringify(action.payload), { expires: 7 });
    },
    logout(state) {
      state.value = null;
      Cookies.remove("user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const authActions = { ...slice.actions };
export const authReducer = slice.reducer;

function createInitialState() {
  try {
    const userCookie = Cookies.get("user");

    if (userCookie) {
      const user = JSON.parse(userCookie);
      return { value: user };
    }
    const userStorage = localStorage.getItem("user");

    if (userStorage) {
      const user = JSON.parse(userStorage);
      return { value: user };
    }
  } catch (error) {
    Cookies.remove("user");
    localStorage.removeItem("user");
  }

  return { value: null };
}