import path from "path";
import { Feed } from "feed";
import { writeFileSync } from "fs";
import { createContentLoader, defineConfig, type SiteConfig } from "vitepress";

const hostname: string = "https://retherszu.github.io";

export default defineConfig({
    title: "Pentest Everything",
    description: "A VitePress Site",
    ignoreDeadLinks: true,
    buildEnd: async (config: SiteConfig) => {
        const feed = new Feed({
            title: "Rether szu",
            description: "My personal blog",
            id: hostname,
            link: hostname,
            language: "en",
            image: "/logo.jpg",
            favicon: "/favicon.ico",
            copyright: "Copyright (c) 2024-present, Rether Szu",
        });

        const posts = await createContentLoader("ctf/**/*.md", {
            excerpt: true,
            render: true,
        }).load();

        const filterdPosts = posts.filter((post) => post.frontmatter?.date !== undefined);

        filterdPosts.sort(
            (a, b) =>
                +new Date(b.frontmatter.date as string) -
                +new Date(a.frontmatter.date as string),
        );

        for (const { url, excerpt, frontmatter } of filterdPosts) {
            feed.addItem({
                title: frontmatter.title,
                id: `${hostname}${url}`,
                link: `${hostname}${url}`,
                description: excerpt,
                author: [
                    {
                        name: "Rether Szu",
                        link: "https://github.com/RetherSzu",
                    },
                ],
                date: frontmatter.date,
            });
        }

        writeFileSync(path.join(config.outDir, "feed.rss"), feed.rss2());
    },
    srcDir: "src",
    themeConfig: {
        logo: "/logo.jpg",
        nav: [
            { text: "Home", link: "/" },
        ],
        outline: {
            level: [1, 3],
        },
        sidebar: [
            {
                text: "Penetration Testing",
                items: [
                    {
                        text: "Hack the box",
                        collapsed: true,
                        items: [
                            {
                                text: "Challenges",
                                collapsed: true,
                                items: [
                                    {
                                        text: "Web",
                                        collapsed: true,
                                        link: "/ctf/hack-the-box/challenges/web",
                                        items: [
                                            { text: "Gunship", link: "/ctf/hack-the-box/challenges/web/gunship" },
                                            { text: "Spookifier", link: "/ctf/hack-the-box/challenges/web/spookifier" },
                                            { text: "PDFy", link: "/ctf/hack-the-box/challenges/web/pdfy" },
                                            { text: "Insomnia", link: "/ctf/hack-the-box/challenges/web/insomnia" },
                                        ],
                                    },
                                ],
                            },
                            {
                                text: "Machines",
                                collapsed: true,
                                items: [
                                    { text: "Chemistry", link: "/ctf/hack-the-box/machines/chemistry" },
                                ],
                            },
                        ],
                    },
                    // { text: "Introduction", link: "/penetration-testing" },
                    // { text: "Reconnaissance", link: "/reconnaissance" },
                    // { text: "Scanning", link: "/scanning" },
                    // { text: "Exploitation", link: "/exploitation" },
                    // { text: "Post-Exploitation", link: "/post-exploitation" },
                    // { text: "Reporting", link: "/reporting" },
                ],
            },
            {
                text: "Vulnerabilities",
                items: [
                    {
                        text: "Web",
                        collapsed: true,
                        items: [
                            { text: "Prototype Pollution", link: "/vulnerabilities/web/prototype-pollution" },
                            { text: "Server-Side Template Injection (SSTI)", link: "/vulnerabilities/web/server-side-template-injection" },
                            { text: "Server-Side Request Forgery (SSRF)", link: "/vulnerabilities/web/server-side-request-forgery" },
                        ],
                    },
                ],
            },
        ],

        socialLinks: [
            { icon: "github", link: "https://github.com/RetherSzu" },
        ],
    },
});
