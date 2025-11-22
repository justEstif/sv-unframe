import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// If user is not authenticated, redirect to home/login page
	if (!locals.user) {
		redirect(307, '/');
	}

	// User is authenticated, return user data
	return {
		user: locals.user
	};
};
