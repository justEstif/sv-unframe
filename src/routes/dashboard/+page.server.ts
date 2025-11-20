import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If user is not authenticated, redirect to home/login page
	if (!locals.user) {
		redirect(307, '/');
	}

	// User is authenticated, return user data
	return {
		user: locals.user
	};
};
