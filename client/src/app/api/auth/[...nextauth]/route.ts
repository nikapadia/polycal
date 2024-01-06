import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { GoogleProfile } from 'next-auth/providers/google';

export const authOptions = {
    providers: [
        GoogleProvider({
            profile(profile: GoogleProfile) {
                // console.log(profile);
                return {
                    ...profile,
                    email: profile.email ?? "",
                    name: profile.name ?? "",
                    image: profile.picture ?? "",
                    id: profile.sub ?? "No ID"
                };
            },
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