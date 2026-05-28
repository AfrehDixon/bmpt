import { withAuth } from 'next-auth/middleware';

// Protect every /admin page. The login page is always allowed through so
// we never create a redirect loop; everything else requires a valid token.
export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      if (req.nextUrl.pathname.startsWith('/admin/login')) return true;
      return !!token;
    },
  },
  pages: { signIn: '/admin/login' },
});

export const config = {
  matcher: ['/admin/:path*'],
};
