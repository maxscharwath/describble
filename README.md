<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/maxscharwath/Describble/assets/6887819/8448d056-b322-4cd5-951e-b388b2e06a46">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/maxscharwath/Describble/assets/6887819/e3868a47-4fef-419e-a3aa-782cff779d41">
    <img alt="Describble logo" width="50%" src="https://github.com/maxscharwath/Describble/assets/6887819/e3868a47-4fef-419e-a3aa-782cff779d41">
  </picture>
</h1>
🎨 Unleash Your Imagination! 🌟

Welcome to DeScribble, an innovative whiteboard application designed to help you collaborate and bring your ideas to life. Created by Maxime Scharwath for his bachelor's thesis at HEIG-VD, DeScribble provides a dynamic platform where people can come together to brainstorm, visualize, and share their ideas in a decentralized environment.

With DeScribble's infinite whiteboard canvas, you have the perfect space to nurture your ideas and watch them flourish. Whether you're planning projects, teaching, or simply letting your imagination run wild, DeScribble empowers you to turn abstract concepts into vibrant visual representations.

Built with the powerful React framework and flexible Scalable Vector Graphics (SVG), DeScribble offers a smooth and immersive user experience. Its decentralized architecture ensures data ownership, privacy, and the freedom to collaborate seamlessly.

Try DeScribble now at https://describble.io and let your ideas come to life in the most captivating way. 🚀


## 📚 Prerequisites

To get started with DeScribble, make sure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) (v16 or higher)
- [pnpm](https://pnpm.io/installation) 📦

## 🏗️ Build

Follow these steps to build all apps and packages in DeScribble:

```bash
pnpm run build
```

### 💻 Develop

To launch the development environment for all apps and packages in DeScribble, use the following command:

```
pnpm run dev
```
This will start the development server, allowing you to experiment, iterate, and enhance the application in real-time.

### ☁️ Remote Caching with Turborepo

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to
share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't
have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
pnpm dlx turbo login
```

This will authenticate the Turborepo CLI with
your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your turborepo:

```
pnpm dlx turbo link
```

## 📚 Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
