import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        })
    ],
    callbacks: {
        // @ts-ignore
        async session({ session, token }){ 
            if (session?.user) session.user.role = token.role;
            return session;
        }
    }
};

export const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};