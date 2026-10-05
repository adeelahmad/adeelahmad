### Adeel Ahmad

Software engineer in Melbourne. I work on applied AI at Commonwealth Bank.

If you've read my CV and wondered how one person ended up working across software, networks, storage, security, cloud and AI, this is the short explanation. Most of it comes from one habit: when something I depend on doesn't make sense to me, I go and learn the layer underneath it.

#### How it happened

**Security first.** I got into computers as a teenager in Lahore by poking at networks. Seeing where systems break was how I learned how they were put together.

**Small companies, every job.** My first jobs (2007 to 2012) were at small companies where the developer also looked after the servers, the network and the phone system. So I learned VMware, Asterisk and Cisco alongside .NET and PHP, because that was what it took to keep things running.

**Running a consultancy.** From 2013 to 2022 I ran Xoho Tech, which grew to about 40 people. It was small enough that I kept writing code. Two problems there shaped a lot of what came later. Power cuts kept wiping out developers' work, so I moved our development into the browser, and that pulled me into virtualisation, containers and eventually Firecracker microVMs. Our archive and media projects needed storage, search, OCR and speech recognition, which is how I first got into machine learning.

**Cloud, then AI.** In 2022 I moved to Melbourne to work as an AWS consultant at Cevo. I'd been experimenting with OpenAI's API since 2021, so when clients started asking about generative AI I had some practice. In 2024 I was tech lead on a clinical AI product at Lyrebird Health, which taught me how much care sensitive data and model output need.

**Now.** Since 2025 I've been at Commonwealth Bank working on AI applications and their security. Outside work I train small models on my own Mac to understand how they learn to reason, and I build tools for running AI agents with clear limits. I still do networking and storage work, because those layers still matter.

#### Personal projects

These are mine, separate from my employer.

- [AgentRC](https://github.com/adeelahmad/agentrc): a draft spec for writing down what an AI agent needs (tools, network, permissions) so the platform running it can decide what to allow.
- [agent-handoff](https://github.com/adeelahmad/package): a small Go tool for carrying decisions and open tasks from one AI session to the next. I wrote it when a conversation on my phone needed to carry on in a different AI tool the next morning.
- [agentic-agile](https://github.com/adeelahmad/agentic-agile): coding agents only start after I approve a plan, and a task only counts as done when its tests pass.
- [mlx-grpo-trainer](https://github.com/adeelahmad/mlx-grpo-trainer), [mlx-guided-grpo](https://github.com/adeelahmad/mlx-guided-grpo) and [mlx-lm-lens](https://github.com/adeelahmad/mlx-lm-lens): training small language models on Apple Silicon, and looking at what fine-tuning changes inside them.
- [JuiceFS fork](https://github.com/adeelahmad/juicefs): storage experiments with caching, snapshots and block access. This is fork work, not an upstream release.
- [OpenWrt traffic control](https://github.com/YusDyr/luci-app-trafficctl/pull/27): a fix to bandwidth limiting and shaping in an OpenWrt router app, merged upstream in August 2026.
- [rclone YouTube filesystem](https://github.com/adeelahmad/rclone/tree/feat/ytfs): built for parental control, so a home media server only shows channels a parent has picked. The upstream proposal was not merged.
- [MacPilot](https://github.com/adeelahmad/MacPilot): an experiment in controlling a Mac with plain-language instructions.

#### More

The longer version, with dates and the skills each step involved, is at [adeelahmad.net](https://adeelahmad.net/). I write occasionally on [Medium](https://blog.adeelahmad.net/).

[LinkedIn](https://www.linkedin.com/in/adeelahmadch/) · [Hugging Face](https://huggingface.co/adeelahmad) · [X](https://www.twitter.com/adeelahmad)
