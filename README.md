### Adeel Ahmad

Software engineer in Melbourne. I work on applied AI at Commonwealth Bank.

If you've read my CV and wondered how one person ended up working across software, networks, storage, security, cloud and AI, this is the short explanation. Most of it comes from one habit: when something I depend on doesn't make sense to me, I go and learn the layer underneath it.

#### How it happened

**Security first.** I got into computers in grade 8 in Lahore by poking at networks, and did my first formal security assessment in 2006 while still at school. Seeing where systems break was how I learned how they were put together.

**Small companies, every job.** My first jobs (2007 to 2012) were at small companies where the developer also looked after the servers, the network and the phone system. So I learned VMware, Asterisk and Cisco alongside .NET and PHP, because that was what it took to keep things running.

**Running a consultancy.** From 2013 to 2022 I ran Xoho Tech, which grew to about 40 people. It was small enough that I kept writing code. Two problems there shaped a lot of what came later. Power cuts kept wiping out developers' work, so I moved our development into the browser, and that pulled me into virtualisation, containers and eventually Firecracker microVMs. Our archive and media projects needed storage, search, OCR and speech recognition, which is how I first got into machine learning.

**Cloud, then AI.** In 2022 I moved to Melbourne to work as an AWS consultant at Cevo. I'd been experimenting with OpenAI's API since 2021, so when clients started asking about generative AI I had some practice. In 2024 I gave a [public talk](https://www.youtube.com/watch?v=pR-Z0Q0i4AI) on building a personal "second brain" on AWS serverless, keeping costs low by using small models for the cheap steps. Later that year I was tech lead on a clinical AI product at Lyrebird Health, which taught me how much care sensitive data and model output need.

**Now.** Since 2025 I've been at Commonwealth Bank working on AI applications and their security. Outside work I train small models on my own Mac to understand how they learn to reason, and I build tools for running AI agents with clear limits. I still do networking and storage work, because those layers matter.

#### Personal projects

These are mine, separate from my employer. Most started because I wanted to understand something or needed it myself, and many are experiments or still in progress. Grouped roughly by area:

**Agents**
- [AgentRC](https://github.com/adeelahmad/agentrc): a draft spec for writing down what an AI agent needs (tools, network, permissions) so the platform running it can decide what to allow. isolated-agent runs those packaged agents locally in isolation.
- [agent-handoff](https://github.com/adeelahmad/package): a small Go tool for carrying decisions and open tasks from one AI session to the next.
- [agentic-agile](https://github.com/adeelahmad/agentic-agile) and aloop: coding agents only start after I approve a plan, and a task only counts as done when its tests pass.
- agentic-completion-cli: a Go proxy with an OpenAI-style API that routes to different model backends and can run tools.
- agentic-py: a small coding agent written in plain bash with curl and jq.
- codemap and CTXConfig: giving coding agents a map of the code by symbol, instead of whole files.
- AIOS: an experiment where models run as ordinary shell users inside containers.
- Agentic Application Studio: a prototype for designing an agent system, from tools and guardrails to training data.
- autocode (2023): generating documentation for a codebase with a language model.

**Training and inspecting models**
- [mlx-grpo-trainer](https://github.com/adeelahmad/mlx-grpo-trainer), [mlx-guided-grpo](https://github.com/adeelahmad/mlx-guided-grpo), mlx-grpo-framework and grow: reinforcement-learning and fine-tuning experiments on Apple Silicon.
- [mlx-lm-lens](https://github.com/adeelahmad/mlx-lm-lens) and mac-mlx: looking inside models to see what fine-tuning changed, layer by layer.
- esc-grpo-analytics: a dashboard for reading training rollouts.

**Knowledge, media and everyday tools**
- [Lens](https://github.com/adeelahmad/lense): a private, self-hosted place for my own notes, files and recordings, with search and answers that cite their sources.
- [anytopdf](https://github.com/adeelahmad/anytopdf-rs) and a media-ingestion pipeline: turning audio, video and images into searchable documents.
- [nametag](https://github.com/adeelahmad/nametag): extended an open-source personal CRM with Google Workspace sync and an assistant.
- Browser extensions to keep my own AI conversations as files, and to run Python inside a document.
- An exam-prep desktop app built with React, Tauri and SQLite.
- [MacPilot](https://github.com/adeelahmad/MacPilot): an experiment in controlling a Mac with plain-language instructions.
- langchain-tutorials (2023): code for a YouTube tutorial series.

**Storage, networks and hardware**
- [JuiceFS fork](https://github.com/adeelahmad/juicefs): storage experiments with caching, snapshots and block access. This is fork work, not an upstream release.
- [OpenWrt traffic control](https://github.com/YusDyr/luci-app-trafficctl/pull/27): a fix to bandwidth limiting and shaping in an OpenWrt router app, merged upstream in August 2026.
- [rclone YouTube filesystem](https://github.com/adeelahmad/rclone/tree/feat/ytfs): built for parental control, so a home media server only shows channels a parent has picked. The upstream proposal was not merged.
- ReqWall: blocking specific requests in the browser or at the router.
- Snapback: browsing backup history read-only, without touching live files.
- A PiKVM interface for fixing machines when the network is down, and gadgetcast and BlueBridge, Raspberry Pi designs for USB audio/video and audio routing.
- Browser-based development environments, from containers to Firecracker microVMs, that started at Xoho.

#### More

The longer version, with dates and the skills each step involved, is at [adeelahmad.net](https://adeelahmad.net/). I write occasionally on [Medium](https://blog.adeelahmad.net/).

[LinkedIn](https://www.linkedin.com/in/adeelahmadch/) · [Hugging Face](https://huggingface.co/adeelahmad) · [X](https://www.twitter.com/adeelahmad)
