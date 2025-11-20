import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If user is authenticated, redirect to dashboard
	if (locals.user) {
		redirect(307, '/dashboard');
	}

	// User is not authenticated, allow access to login/signup page
	return {};
};
