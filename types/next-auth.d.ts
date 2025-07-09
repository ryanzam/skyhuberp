/* import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      company: string;
      companyName: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    company: { _id: string; name: string };
    companyName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    company: string;
    companyName: string;
  }
} */