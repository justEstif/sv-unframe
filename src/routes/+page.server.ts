import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	// If user is authenticated, redirect to dashboard
	if (locals.user) {
		redirect(307, '/your-courses');
	}

	// User is not authenticated, allow access to login/signup page
	return {};
};
