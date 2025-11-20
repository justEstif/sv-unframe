import { isRedirect, redirect } from "@sveltejs/kit";
import { form, getRequestEvent, query } from "$app/server";
import { auth } from "$lib/server/auth";
import { z } from "zod";
import { APIError } from "better-auth";

const signupSchema = z.object({
  name: z.string().min(4),
  email: z.email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const signup = form(signupSchema, async (user, invalid) => {
  try {
    await auth.api.signUpEmail({ body: user });
    redirect(307, "/dashboard");
  } catch (error) {
    if (isRedirect(error)) {
      throw error;
    }
    if (error instanceof APIError) {
      console.log(error.message, error.status);
      invalid.password(error.message);
    }
    throw error;
  }
});

export const login = form(loginSchema, async (user, invalid) => {
  const { request } = getRequestEvent();
  try {
    await auth.api.signInEmail({ body: user, headers: request.headers });
    redirect(303, "/dashboard");
  } catch (error) {
    if (isRedirect(error)) {
      throw error;
    } else if (error instanceof APIError) {
      console.log(error.message, error.status);
      invalid.password(error.message);
    } else {
      throw error;
    }
  }
});

export const signout = form(async (_, invalid) => {
  const { request } = getRequestEvent();

  try {
    await auth.api.signOut({ headers: request.headers });
    redirect(303, "/");
  } catch (error) {
    if (isRedirect(error)) {
      throw error;
    } else if (error instanceof APIError) {
      console.log(error.message, error.status);
      invalid(error.message);
    } else {
      throw error;
    }
  }
});

export const getUser = query(async () => {
  const { locals } = getRequestEvent();
  // if (!locals.user) {
  //   redirect(307, "/auth/login");
  // }
  return locals.user;
});
