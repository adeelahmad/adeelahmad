<div align="center">

# Adeel Ahmad

**First-principles engineering · Applied AI · Security**

Two decades of hands-on engineering, from software and bare-metal infrastructure to agentic AI and model behaviour. I build systems, investigate the assumptions they depend on, and turn what I learn into reusable tools.

**Own your compute. Understand your systems. Verify what you trust.**

[![Blog](https://img.shields.io/badge/Blog-adeelahmad.net-0A0A0A?style=flat-square&logo=hashnode&logoColor=white)](https://blog.adeelahmad.net/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-adeelahmadch-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/adeelahmadch/)
[![X](https://img.shields.io/badge/X-adeelahmad-000000?style=flat-square&logo=x&logoColor=white)](https://x.com/adeelahmad)
[![Hugging Face](https://img.shields.io/badge/Hugging_Face-adeelahmad-FFD21E?style=flat-square)](https://huggingface.co/adeelahmad)

</div>

---

### What I do

I'm based in **Melbourne, Australia**, working in **Commonwealth Bank's AI Centre of Excellence, within the AI Acceleration squad**. My role is Staff Platform Engineer (MLOps); my work centres on **applied AI/GenAI engineering, experimentation, and hands-on technical leadership**. I also serve as a **Security Champion**.

Before that, I worked in AWS consulting at **Cevo** and on the GenAI application architecture at **Lyrebird Health**. Earlier, I founded and led **Xoho Tech** for 13 years, growing it to around 40 people. I stayed hands-on while owning architecture, delivery, infrastructure, security, and the customer relationship.

That is where my range comes from: writing the application, operating the systems beneath it, and being accountable for whether it solved the customer's problem.

Alongside my day job, I build open-source agent tooling, experiment with language-model training and interpretability on Apple Silicon, and continue working on filesystems, storage, and networking.

### How I approach a problem

I don't experience software, networking, identity, storage, and AI as disconnected specialties. I follow the dependencies through one system: what must stay true, where that guarantee belongs, and how to test it.

When I don't understand something, I tend to build or inspect what sits underneath it. That has taken me from private-cloud clusters and packet paths to model-training loops and agent execution contracts.

A recurring design choice is to **separate the lasting asset from the implementation**: an agent's definition from its runtime, a decision from its chat session, or a storage capability from its backend. The aim is not another abstraction for its own sake. It is less duplication, clearer boundaries, and something other people can use.

---

### Agent infrastructure

**[AgentRC](https://agentrc.ai/) · [source](https://github.com/adeelahmad/agentrc)**  
An open, Dockerfile-shaped specification for declaring and packaging portable agents. An `Agentfile` captures identity, capabilities, instructions, and typed policy requests; OCI labels carry those declarations for the platform to grant, narrow, or reject. Includes Go reference tooling and a BuildKit frontend. **Working draft—not a runtime, sandbox, or finished standard.**

**[agent-handoff](https://github.com/adeelahmad/package)**  
“Git for agents”: a Go tool that packages selected context, settled decisions, open questions, and ordered tasks into a self-contained, versioned handoff. The working tree shows the current version; agents query history instead of browsing stale copies. One static binary per platform, with no runtime dependencies. Built because useful work from one AI session should not need to be reconstructed in the next.

**[agentic-agile](https://github.com/adeelahmad/agentic-agile)**  
A Claude Code plugin for human-approved planning and agent-driven implementation, with Git-worktree isolation and hook-enforced TDD and review gates. Workflow checks live outside the model rather than relying only on instructions in a prompt.

### Language-model training and inspection

**[mlx-grpo-trainer](https://github.com/adeelahmad/mlx-grpo-trainer)** and **[mlx-guided-grpo](https://github.com/adeelahmad/mlx-guided-grpo)**  
MLX-based reinforcement-learning and GRPO training tools for Apple Silicon, including configurable rewards, supervised fine-tuning, and curriculum-guided experimentation.

**[mlx-lm-lens](https://github.com/adeelahmad/mlx-lm-lens)**  
Mechanistic-interpretability tooling for inspecting transformer predictions and activations, comparing adapted models with references, and investigating changes in model behaviour on Apple Silicon.

**[MacPilot](https://github.com/adeelahmad/MacPilot)**  
Natural-language macOS automation combining language models with native accessibility, screen analysis, and AppleScript integration.

My independent AI-security interests include **agent identity and authorization, model supply-chain integrity, behavioural changes after fine-tuning, and evaluation of agentic systems**. The public tools above support that investigation; research findings remain separate from established security guarantees.

---

### Systems work you can inspect

**[OpenWrt traffic control — merged upstream contribution](https://github.com/YusDyr/luci-app-trafficctl/pull/27)**  
Fixed bidirectional traffic enforcement by following the actual bridge, conntrack, and NAT packet paths, including IFB-based upload shaping. Added routed-subnet monitoring, port-forward controls, device naming, and optional DPI integration, with regression tests. Developed against my GL-MT3000 and downstream MikroTik network; merged in August 2026.

**[JuiceFS — my development fork](https://github.com/adeelahmad/juicefs)**  
Work on ZFS-inspired dataset management, content-addressed storage, tiered caching, integrity verification, snapshots and replication, additional object backends, and NBD/iSCSI block access. Features are at different stages of integration and validation. These are changes in my fork, not upstream JuiceFS releases.

**[YouTube filesystem for rclone — parental-control prototype](https://github.com/adeelahmad/rclone/tree/feat/ytfs)**  
Built around a family problem: present parent-selected YouTube channels and playlists through **Emby**, alongside local media, rather than expose unrestricted YouTube browsing. The adapter represents videos and metadata as read-only filesystem objects so existing media software can consume them. The [upstream proposal](https://github.com/rclone/rclone/pull/9657) was closed without merging; this remains work in my fork. Curation controls the available sources, not the suitability of every future upload.

These projects are also how I keep my systems experience current: not just technologies I used years ago, but problems I still build, test, and debug today.

---

### A few points on the timeline

**4 June 2021 — OpenAI API private-beta access.**  
Received access while running **Xoho Tech in Pakistan**. This is the access-granted date, not the application date—approximately 18 months before [ChatGPT's public introduction](https://openai.com/index/chatgpt/).

**24 October 2023 — Multi-agent customer-engineering prototype.**  
Shared an [AutoGen notebook](https://colab.research.google.com/gist/adeelahmad/e26b3e6888fe2066d2ac8ea7911e4f07/iterative-approach-to-discovering-gen-ai-opportunities-for-business-impact-aws-cloud-professionals-as-autoagents.ipynb) modelling an AWS-style customer team: account manager, solutions architect, critic, engineer, and executor, with human oversight and generation of additional role-specific agents.

**2024 — Public second-brain architecture talk.**  
[Presented at Melbourne Serverless](https://www.youtube.com/watch?v=pR-Z0Q0i4AI) on personal knowledge systems using serverless infrastructure, semantic retrieval, small/local models, asynchronous processing, and source-grounded generation. I also described my existing workflow for turning articles into conversational audio. The central principle: use the model to reason over selected knowledge rather than treating its training data as the source of truth.

**March 2025 — Joined CBA's AI Acceleration squad.**  
Continued the move from AWS consulting and healthcare GenAI into enterprise applied AI and technical leadership.

**2026 — Portable agents, persistent context, and systems work.**  
AgentRC, agent-handoff, and agentic-agile alongside MLX experimentation, storage-system development, and upstream networking contributions.

<details>
<summary><b>Earlier foundations — software, security, infrastructure, and communications</b></summary>
<br/>

My security experience began with vulnerability assessment and penetration testing as a teenager, including a formal engagement for a US healthcare company at 16 and a recommendation from its CEO.

Early professional work at APTLOGIX and PureLogics combined application development with systems administration and network security. My first hypervisor experience was with VMware during the PureLogics period, followed by Citrix XenServer and later Proxmox. Asterisk PBX work began in that early period too, with 3CX following later.

The networking foundation included Cisco PIX firewalls, Catalyst switches, and routers, later expanding into Vyatta, pfSense, OPNsense, MikroTik, and OpenWrt.

At Xoho Tech, the work included digital-preservation and archival-metadata systems, media platforms, enterprise applications, and the infrastructure needed to deliver and operate them. Running the consultancy meant working directly with customers as well as leading engineers.

In my homelab, I built a three-host Proxmox/Ceph/ZFS cluster with more than 150 TB of storage and a 25 GbE fabric, and assembled Kubernetes from scratch. Understanding the machinery beneath an abstraction has been a practical learning method throughout my career.

</details>

---

<details>
<summary><b>Hands-on engineering background</b></summary>
<br/>

**Software and web**  
C, C++, Rust, Go, Python, Ruby, PHP, JavaScript/TypeScript, Java, Swift, Perl, Bash, Lua, and AppleScript. Web work spans table-based HTML layouts, jQuery and CoffeeScript, through React, Angular, Svelte, Rails, Node.js, Symfony, Laravel, and Spring. Browser extensions, service workers, automation, and backend services.

**Virtualization and operating systems**  
VMware, Citrix XenServer, Proxmox, KVM/QEMU, Libvirt, Firecracker, rust-vmm, Cloud Hypervisor, OpenStack, and OpenNebula. Linux administration, kernel and network tuning, PXE/iPXE boot, device passthrough, and private-cloud operations.

**Networking and identity**  
Cisco PIX/Catalyst, MikroTik, OpenWrt, Vyatta, pfSense, and OPNsense. VLANs, routing, NAT, OSPF/BGP, FRRouting, Open vSwitch, VXLAN, nftables/iptables, and traffic shaping. WireGuard, IPsec, Nebula, Tailscale, ZeroTier, and Cloudflare Tunnel/Zero Trust. LDAP/AD, Kerberos, SAML, FreeRADIUS, Keycloak, OAuth, and workload-identity patterns.

**Storage and filesystems**  
Ceph/RADOS/CephFS, ZFS, GlusterFS, Btrfs, ext4, XFS, NFS, iSCSI, SMB, MinIO/S3, rclone, JuiceFS, mergerfs, and FUSE. Snapshotting, replication, backup and recovery, cache design, content integrity, and NAS integration.

**Security engineering**  
Threat modelling, vulnerability assessment, identity and access control, network security, hardening, and forensic investigation. CIS automation, Snort, Nmap/Rustscan, mitmproxy, Frida, OpenSSL, gitleaks, KMS, and security-aware delivery pipelines. Experience building for regulated environments.

**Cloud, containers, and delivery**  
AWS, Azure, serverless architectures, Lambda, ECS/EKS, Kubernetes, Docker/Swarm, Podman, and Kata Containers. Container networking and volume plugins, AppArmor, infrastructure as code, GitHub Actions, GitLab CI, CircleCI, and AWS CodeBuild/CodePipeline.

**Data, search, and observability**  
PostgreSQL, MySQL/MariaDB, MongoDB, Redis, InfluxDB, Snowflake, dbt, Solr, and Elasticsearch. Data integration, metadata, lineage, retrieval, and caching. Prometheus/Grafana, ELK, Nagios, OpenNMS, Cacti, SmokePing, Netdata, SNMP, and network-performance tooling.

**AI and machine learning**  
MLX, PyTorch, LoRA, GRPO, reinforcement learning, model evaluation, and mechanistic interpretability. Bedrock/AgentCore, Amazon Q Business, multi-provider orchestration, RAG, FAISS/Qdrant/pgvector, AutoGen, LangChain, and MCP. Earlier work includes Kaldi/DeepSpeech speech recognition, Tesseract OCR, face recognition, and searchable video pipelines.

**Telephony and IoT**  
Asterisk/FreePBX, 3CX, SIP, Opus, WebRTC/STUN/ICE, GSM integration with `chan_dongle`, SMS gateways, and call-recording/transcription workflows. IoT integration with Zigbee, Z-Wave, and MQTT.

</details>

### Certifications earned

AWS Solutions Architect — Professional and Associate · Snowflake SnowPro Core · ITIL v3

---

<div align="center">

**Make the useful thing reusable. Make the trust boundary explicit.**

Arctic Code Vault Contributor · Based in Melbourne, Australia

<sub>Personal projects and views; not statements on behalf of my employer.</sub>

</div>
