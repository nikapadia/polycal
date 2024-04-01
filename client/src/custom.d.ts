// This is so stupid, but it's the only way to make TypeScript happy with images
declare module "*.png" {
    const value: any;
    export = value;
}