/* ============================================================
 *  所追寻的风 - 个人博客 · 交互脚本
 *  粒子动画 / 打字机 / 导航 / 滚动渐显 / AI 对话
 * ============================================================ */

;(function () {
    'use strict';

    /* ==================== 1. 粒子画布 ==================== */
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animId;

        function resize() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        /* 菱形粒子 */
        class Particle {
            constructor() {
                this.init();
                /* 随机初始 Y 位置，遍布屏幕 */
                this.y = Math.random() * (canvas.offsetHeight || window.innerHeight);
            }
            init() {
                this.x = Math.random() * (canvas.offsetWidth || window.innerWidth);
                this.size = Math.random() * 2.5 + 0.8;
                this.speedY = -(Math.random() * 0.5 + 0.15);
                this.speedX = (Math.random() - 0.5) * 0.35;
                this.rot = Math.random() * Math.PI * 2;
                this.rotSpeed = (Math.random() - 0.5) * 0.015;
                this.opacity = Math.random() * 0.5 + 0.15;
                const hue = Math.random() < 0.6 ? 265 : 190;
                this.color = `hsla(${hue}, 75%, 62%, ${this.opacity})`;
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                this.rot += this.rotSpeed;
                this.opacity += (Math.random() - 0.5) * 0.015;
                this.opacity = Math.max(0.08, Math.min(0.7, this.opacity));
                /* 超出上/左/右边界时重生到底部 */
                const w = canvas.offsetWidth || window.innerWidth;
                const h = canvas.offsetHeight || window.innerHeight;
                if (this.y < -10 || this.x < -10 || this.x > w + 10) {
                    this.init();
                    this.y = h + 10;
                }
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rot);
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 6;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                const s = this.size;
                ctx.moveTo(0, -s);
                ctx.lineTo(s, 0);
                ctx.lineTo(0, s);
                ctx.lineTo(-s, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }

        function initParticles() {
            resize();
            const w = canvas.offsetWidth || window.innerWidth;
            const h = canvas.offsetHeight || window.innerHeight;
            const count = Math.min(100, Math.floor((w * h) / 6000));
            particles = Array.from({ length: count }, () => new Particle());
        }

        function animate() {
            const hero = document.getElementById('home');
            if (!hero) { animId = requestAnimationFrame(animate); return; }
            const rect = hero.getBoundingClientRect();
            const visible = rect.bottom > 0 && rect.top < window.innerHeight;
            if (visible) {
                ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
                particles.forEach(p => { p.update(); p.draw(); });
            }
            animId = requestAnimationFrame(animate);
        }

        initParticles();
        animate();
        window.addEventListener('resize', () => { resize(); initParticles(); });
    }

    /* ==================== 2. 打字机文字效果 ==================== */
    const twEl = document.getElementById('typewriter');
    if (twEl) {
        const texts = [
            '这是我的个人博客，记录我的学习和生活点滴。',
            '欢迎来到我的世界——一个技术与梦想交织的空间。',
            '「有时候只需要换个角度看问题，一切都不一样了。」',
        ];
        let ti = 0, ci = 0, deleting = false, timer, videoStarted = false;
        const heroVideo = document.getElementById('heroVideo');

        function startHeroVideo() {
            if (heroVideo && !videoStarted) {
                videoStarted = true;
                heroVideo.play().catch(() => {});
            }
        }

        function type() {
            const current = texts[ti];
            if (deleting) {
                twEl.textContent = current.substring(0, ci - 1);
                ci--;
                if (ci <= 0) {
                    deleting = false;
                    ti = (ti + 1) % texts.length;
                    timer = setTimeout(type, 300);
                    return;
                }
                timer = setTimeout(type, 45);
            } else {
                twEl.textContent = current.substring(0, ci + 1);
                ci++;
                if (ci >= current.length) {
                    if (ti === texts.length - 1) startHeroVideo();
                    deleting = true;
                    timer = setTimeout(type, 2200);
                    return;
                }
                timer = setTimeout(type, 90);
            }
        }

        type();
        window.addEventListener('beforeunload', () => { if (timer) clearTimeout(timer); });
    }

    /* ==================== 3. 导航栏滚动阴影 ==================== */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 30);
        }, { passive: true });
    }

    /* ==================== 4. 移动端菜单 ==================== */
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobilePanel = document.getElementById('mobilePanel');
    if (menuBtn && mobilePanel) {
        /* 创建遮罩层 */
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);

        function openMenu() {
            menuBtn.classList.add('active');
            mobilePanel.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        function closeMenu() {
            menuBtn.classList.remove('active');
            mobilePanel.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        menuBtn.addEventListener('click', () => {
            mobilePanel.classList.contains('open') ? closeMenu() : openMenu();
        });

        overlay.addEventListener('click', closeMenu);

        /* 点击面板内链接关闭菜单 */
        mobilePanel.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        /* ESC 关闭 */
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && mobilePanel.classList.contains('open')) closeMenu();
        });
    }

    /* ==================== 5. 滚动渐显动画 ==================== */
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        reveals.forEach(el => observer.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('visible'));
    }

    /* ==================== 6. 回到顶部 + 滚动进度条 ==================== */
    const backBtn = document.getElementById('backToTop');
    const progressBar = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
        const sy = window.scrollY;
        if (backBtn) backBtn.classList.toggle('visible', sy > 500);
        if (progressBar) {
            const dh = document.documentElement.scrollHeight - window.innerHeight;
            progressBar.style.width = dh > 0 ? (sy / dh * 100) + '%' : '0';
        }
    }, { passive: true });
    if (backBtn) {
        backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ==================== 7. 导航栏激活状态更新 ==================== */
    function updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-item[href^="#"]');
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 100;
            if (window.scrollY >= top) current = sec.getAttribute('id');
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });

    /* ==================== 8. 运行天数统计 ==================== */
    const runningDaysEl = document.getElementById('runningDays');
    if (runningDaysEl) {
        const startDate = new Date('2024-12-08');
        const now = new Date();
        const days = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        runningDaysEl.textContent = days;
    }

    /* ==================== 9. 银狼 AI 对话系统 ==================== */

    /* ---- 登录认证 ---- */
    const loginForm = document.getElementById('loginForm');
    const chatLogin = document.getElementById('chatLogin');
    const chatInterface = document.getElementById('chatInterface');
    const loginError = document.getElementById('loginError');

    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            if (username === 'admin' && password === 'admin') {
                chatLogin.style.display = 'none';
                chatInterface.style.display = 'flex';
                loginError.textContent = '';
                localStorage.setItem('silverwolf_logged_in', 'true');
            } else {
                loginError.textContent = '账号或密码错误，请重试';
                /* 抖动效果 */
                loginForm.style.animation = 'none';
                loginForm.offsetHeight; /* reflow */
                loginForm.style.animation = 'shake 0.5s ease';
            }
        });
    }

    /* 退出登录 */
    const chatLogout = document.getElementById('chatLogout');
    if (chatLogout) {
        chatLogout.addEventListener('click', () => {
            chatInterface.style.display = 'none';
            chatLogin.style.display = 'block';
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
            localStorage.removeItem('silverwolf_logged_in');
        });
    }

    /* 恢复登录状态 */
    if (localStorage.getItem('silverwolf_logged_in') === 'true') {
        if (chatLogin && chatInterface) {
            chatLogin.style.display = 'none';
            chatInterface.style.display = 'flex';
        }
    }

    /* ---- 消息系统 ---- */
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');

    if (chatInput && chatSend && chatMessages) {

        /* ====== AI API 配置（SiliconFlow / OpenAI 兼容接口） ====== */
        const API_URL = '';
        const API_KEY = '';
        /* 可选模型：deepseek-ai/DeepSeek-V3, Qwen/Qwen2.5-7B-Instruct, Pro/DeepSeek-V4-Pro */
        const AI_MODEL = 'deepseek-ai/DeepSeek-V4-Flash';
        /* ========================================== */

        /* 添加消息 */
        function addMsg(type, text) {
            const div = document.createElement('div');
            div.className = `msg-row msg-${type}`;
            if (type === 'bot') {
                div.innerHTML = '<img src="images/银狼0.jpg" alt="银狼" class="msg-avatar">'
                    + '<div class="msg-bubble">' + fmtMsg(text) + '</div>';
            } else {
                div.innerHTML = '<div class="msg-bubble">' + fmtMsg(text) + '</div>';
            }
            chatMessages.appendChild(div);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function fmtMsg(text) {
            return text.split('\n').map(l => '<p>' + esc(l) + '</p>').join('');
        }
        function esc(s) {
            const d = document.createElement('div');
            d.textContent = s;
            return d.innerHTML;
        }

        function showTyping() {
            const div = document.createElement('div');
            div.className = 'msg-row msg-bot';
            div.id = 'typingInd';
            div.innerHTML = '<img src="images/银狼0.jpg" alt="银狼" class="msg-avatar">'
                + '<div class="msg-bubble"><div class="typing-dots">'
                + '<span></span><span></span><span></span></div></div>';
            chatMessages.appendChild(div);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        function hideTyping() {
            const el = document.getElementById('typingInd');
            if (el) el.remove();
        }

        /* 本地预设回复（API 不可用时降级） */
        const fallbackReplies = [
            '嘿，这个问题有点意思。让我想想...作为星穹列车的骇客，我见过不少类似的情况呢。',
            '你知道吗？在以太战线里，我可是最强的玩家之一。不过现在嘛，我更想跟你聊聊这个。',
            '代码和游戏其实挺像的——都需要策略、技巧，还有一点点运气。你有什么想讨论的？',
            '如果让我黑进你的电脑...开个玩笑。不过说真的，安全永远是第一位的。',
            '我喜欢用最简洁的代码实现最酷的功能。毕竟我的风格就是——高效，带点炫技。',
            '星穹列车的冒险还在继续，你的故事呢？有什么想分享的吗？',
            '这个世界的数据流里藏着无数秘密。有时候只需要换个角度看问题，一切都不一样了。',
            '有趣的对话。要不要来一局《以太战线》？虽然我觉得你赢不了我。',
            '作为星核猎手的一员，我见过太多不可能变成可能。所以你也要相信奇迹，大概。',
        ];

        function getFallbackReply(msg) {
            const m = msg.toLowerCase();
            if (/你好|hi|hello/.test(m))
                return '哟！你好啊。我是银狼，星穹列车的超级骇客。有什么可以帮你的？';
            if (/你是谁|介绍/.test(m))
                return '我是银狼，星核猎手的成员，星穹列车上的骇客。擅长编程、游戏、还有...一些不太方便明说的事情。';
            if (/代码|编程|python|c\+\+|rust|js|javascript/.test(m))
                return '代码啊，那可是我的拿手好戏。无论是什么语言，只要你想聊，我都能奉陪。记得保持代码整洁，不然我会忍不住帮你重构的。';
            if (/游戏|以太战线/.test(m))
                return '以太战线！那可是我的主场。要不要来一局？不过输了可别哭鼻子哦～';
            if (/星穹铁道|崩坏|开拓者/.test(m))
                return '星穹铁道上的冒险总是充满惊喜。从空间站到各个星球，每一站都有新的故事和挑战。';
            return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
        }

        async function getAIReply(msg) {
            if (!API_URL) return getFallbackReply(msg);
            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(API_KEY ? { 'Authorization': 'Bearer ' + API_KEY } : {}),
                    },
                    body: JSON.stringify({
                        model: AI_MODEL,
                        messages: [
                            { role: 'system', content: '你是银狼，星穹铁道中的超级骇客，星核猎手的成员。你擅长编程、游戏和黑客技术。你的性格冷静自信，带点傲娇，说话风格简洁高效，偶尔带点炫技。请用中文回复，保持角色设定。' },
                            { role: 'user', content: msg }
                        ],
                        temperature: 0.7,
                        max_tokens: 500,
                    }),
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error('HTTP ' + res.status + ': ' + errText);
                }
                const data = await res.json();
                const reply = data.choices?.[0]?.message?.content;
                if (!reply) throw new Error('AI 返回内容为空');
                return reply;
            } catch (err) {
                console.warn('AI API 调用失败，使用本地回复:', err);
                return getFallbackReply(msg);
            }
        }

        async function send() {
            const text = chatInput.value.trim();
            if (!text) return;

            chatSend.disabled = true;
            chatInput.value = '';
            chatInput.style.height = 'auto';

            addMsg('user', text);
            showTyping();

            const reply = await getAIReply(text);

            hideTyping();
            addMsg('bot', reply);

            chatSend.disabled = false;
            chatInput.focus();
        }

        chatInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
            }
        });
        chatSend.addEventListener('click', send);

        /* 输入框自动增高 */
        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
        });
    }

    /* ==================== 10. 视频灯箱 ==================== */
    const videoLightbox = document.getElementById('videoLightbox');
    const videoLightboxBackdrop = document.getElementById('videoLightboxBackdrop');
    const videoLightboxClose = document.getElementById('videoLightboxClose');
    const videoLightboxPlayer = document.getElementById('videoLightboxPlayer');
    const videoCards = document.querySelectorAll('.video-card[data-video-src]');

    function openVideoLightbox(src) {
        if (!videoLightbox || !videoLightboxPlayer) return;
        videoLightboxPlayer.querySelector('source').src = src;
        videoLightboxPlayer.load();
        videoLightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        videoLightboxPlayer.play();
    }
    function closeVideoLightbox() {
        if (!videoLightbox || !videoLightboxPlayer) return;
        videoLightboxPlayer.pause();
        videoLightboxPlayer.querySelector('source').src = '';
        videoLightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            const src = card.getAttribute('data-video-src');
            if (src) openVideoLightbox(src);
        });
    });
    if (videoLightboxBackdrop) videoLightboxBackdrop.addEventListener('click', closeVideoLightbox);
    if (videoLightboxClose) videoLightboxClose.addEventListener('click', closeVideoLightbox);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && videoLightbox && videoLightbox.classList.contains('open')) closeVideoLightbox();
    });

    /* ==================== 11. 博客文章数据与详情弹窗 ==================== */
    const blogPosts = [
        {
            id: 1,
            title: '深度学习入门：从感知机到Transformer',
            date: '2025-06-15',
            categories: ['AI'],
            tags: ['AI', '深度学习', 'Transformer', 'Python', 'PyTorch'],
            content: `<p>深度学习是机器学习的一个重要分支，它通过模拟人脑的神经网络结构来实现对数据的自动特征提取和模式识别。本文将带你从最基础的感知机模型出发，一路走到改变NLP格局的Transformer架构。</p>
<h2>一、感知机：一切的起点</h2>
<p>感知机（Perceptron）是神经网络的最基本单元，由Frank Rosenblatt于1957年提出。它模拟了生物神经元的工作方式：接收多个输入信号，通过加权求和后经过激活函数输出结果。</p>
<p>感知机的数学表达式为：<code>y = f(w·x + b)</code>，其中 w 是权重向量，x 是输入向量，b 是偏置，f 是激活函数。最初的感知机使用阶跃函数作为激活函数，这导致它只能解决线性可分问题。</p>
<p>单层感知机无法解决XOR（异或）问题，这一发现在1969年由Minsky和Papert证明，直接导致了神经网络研究的第一个"寒冬"。</p>
<h2>二、多层感知机与反向传播</h2>
<p>多层感知机（MLP）通过引入隐藏层来克服单层感知机的局限。1986年，Rumelhart等人提出了反向传播算法（Backpropagation），使得多层神经网络的训练成为可能。</p>
<p>反向传播的核心思想是：通过链式法则计算损失函数对每个参数的梯度，然后使用梯度下降来更新参数。这一算法至今仍是深度学习的基础。</p>
<p>关键公式：<code>δ = ∂L/∂z</code>（误差项），<code>∂L/∂w = δ·a</code>（权重梯度），<code>∂L/∂b = δ</code>（偏置梯度）。</p>
<h2>三、卷积神经网络（CNN）</h2>
<p>卷积神经网络由Yann LeCun在1998年提出（LeNet-5），专门用于处理具有网格结构的数据，如图像。CNN的核心组件包括：</p>
<ul>
    <li><strong>卷积层</strong>：使用可学习的滤波器（卷积核）在输入上滑动，提取局部特征。通过参数共享大幅减少参数数量。</li>
    <li><strong>池化层</strong>：对特征图进行下采样，保留重要特征的同时降低计算量。常见的有最大池化和平均池化。</li>
    <li><strong>全连接层</strong>：将提取的特征映射到最终的输出空间。</li>
</ul>
<p>2012年，AlexNet在ImageNet竞赛中取得突破性成绩，掀起了深度学习的热潮。后续的VGG、GoogLeNet（Inception）、ResNet等架构不断刷新记录。</p>
<p>ResNet引入的残差连接（Skip Connection）解决了深层网络的梯度消失问题，使得训练上百层的网络成为可能。</p>
<h2>四、循环神经网络（RNN）与LSTM</h2>
<p>循环神经网络专为序列数据设计，其核心特点是具有"记忆"能力——当前时刻的输出不仅取决于当前输入，还取决于之前时刻的隐藏状态。</p>
<p>然而，传统RNN存在严重的梯度消失/爆炸问题，导致无法处理长序列依赖。</p>
<p>长短期记忆网络（LSTM）由Hochreiter和Schmidhuber于1997年提出，通过引入门控机制（遗忘门、输入门、输出门）和细胞状态，有效解决了长程依赖问题。</p>
<p>GRU（门控循环单元）是LSTM的简化版本，将遗忘门和输入门合并为更新门，在保持性能的同时减少参数量。</p>
<h2>五、注意力机制与Transformer</h2>
<p>2017年，Google团队的论文《Attention Is All You Need》提出了Transformer架构，彻底改变了NLP领域。</p>
<p>Transformer的核心创新包括：</p>
<ul>
    <li><strong>自注意力机制</strong>：让模型在处理每个词时都能"关注"到序列中的所有词，计算它们之间的关联权重。公式为：<code>Attention(Q,K,V) = softmax(QK^T/√d_k)V</code>。</li>
    <li><strong>多头注意力</strong>：并行运行多个注意力头，每个头关注不同的表示子空间，最后拼接结果。</li>
    <li><strong>位置编码</strong>：由于Transformer没有循环结构，需要额外注入位置信息。</li>
    <li><strong>前馈网络与残差连接</strong>：每个注意力层后接一个全连接前馈网络，并通过残差连接和层归一化稳定训练。</li>
</ul>
<p>基于Transformer的预训练模型（BERT、GPT系列、T5等）在几乎所有NLP任务上取得了SOTA成绩。2022年底，ChatGPT的发布更是将大语言模型推向了大众视野。</p>
<h2>六、总结与展望</h2>
<p>从感知机到Transformer，深度学习走过了六十余年的发展历程。每一次技术突破都源于对前人工作的继承与创新。当前，多模态模型、强化学习、扩散模型等方向正在推动AI能力的边界。</p>
<p>对于初学者来说，理解这些基础概念是深入学习AI的第一步。建议动手实现一个简单的MLP或CNN，感受神经网络的实际运作方式。</p>`
        },
        {
            id: 2,
            title: 'C++ 20 协程实战指南：异步编程新范式',
            date: '2025-05-20',
            categories: ['C++'],
            tags: ['C++', '协程', '异步', '并发'],
            content: `<p>C++20 引入了协程（Coroutines），为异步编程带来了全新的范式。与传统的回调、Future/Promise模式相比，协程让异步代码可以像同步代码一样直观易读。</p>
<h2>一、什么是协程</h2>
<p>协程是一种可以暂停和恢复执行的函数。与普通函数不同，协程可以在执行中途"暂停"，将控制权交还给调用者，之后再从暂停点继续执行。这使得编写非阻塞的异步代码变得非常自然。</p>
<p>C++20 的协程是<strong>无栈协程</strong>——协程的状态存储在堆上分配的对象中，而非调用栈。这种设计使得协程可以作为值传递、存储在容器中，灵活性极高。</p>
<h2>二、三大关键字</h2>
<p>C++20 协程围绕三个关键字展开：</p>
<ul>
    <li><strong>co_await</strong>：暂停当前协程，等待某个操作完成。例如 <code>co_await some_async_operation()</code>。</li>
    <li><strong>co_yield</strong>：暂停协程并返回一个值，用于生成器模式。</li>
    <li><strong>co_return</strong>：结束协程并返回最终值。</li>
</ul>
<h2>三、Promise 类型与 Awaitable</h2>
<p>C++20 协程框架的核心是 <strong>Promise 类型</strong>——一个由用户定义的类型，编译器通过它来控制协程的行为。Promise 类型需要实现以下接口：</p>
<pre>struct promise_type {
    auto get_return_object();
    auto initial_suspend();
    auto final_suspend() noexcept;
    void unhandled_exception();
    void return_void();  // 或 return_value(T v)
};</pre>
<p><strong>Awaitable</strong> 是可以用 co_await 等待的类型。一个类型要成为 Awaitable，需要实现：</p>
<pre>struct Awaitable {
    bool await_ready();              // 是否已就绪（无需暂停）
    void await_suspend(handle);      // 暂停时的回调
    T    await_resume();             // 恢复时返回的值
};</pre>
<h2>四、实战：异步文件读取</h2>
<p>下面是一个使用协程实现异步文件读取的示例：</p>
<pre>Task&lt;std::string&gt; readFileAsync(const std::string&amp; path) {
    auto handle = co_await async_open(path);
    std::string content;
    char buffer[4096];
    while (auto bytes = co_await async_read(handle, buffer, sizeof(buffer))) {
        content.append(buffer, bytes);
    }
    co_await async_close(handle);
    co_return content;
}</pre>
<p>这段代码看起来就像是同步代码，但实际执行时会在每次 I/O 操作时暂停，让出 CPU 给其他任务，从而实现高效的并发。</p>
<h2>五、注意事项</h2>
<ul>
    <li>C++20 协程是无栈协程，不适合需要深度递归切换的场景。</li>
    <li>协程帧（coroutine frame）在堆上分配，高频创建可能带来性能开销。C++23 有望改善这一点。</li>
    <li>目前主流编译器（GCC 11+、Clang 14+、MSVC 2022）都已较好地支持 C++20 协程。</li>
    <li>推荐使用成熟的协程库（如 cppcoro）来避免手写 Promise 类型的繁琐工作。</li>
</ul>
<h2>六、总结</h2>
<p>C++20 协程为 C++ 异步编程带来了革命性的变化。尽管目前的标准库支持还不够完善（缺少 generator、task 等基础类型），但社区已经在积极填补这些空白。掌握协程，将让你的 C++ 代码在现代异步编程中更加优雅和高效。</p>`
        },
        {
            id: 3,
            title: '打造个人AI助手：从零到部署完整指南',
            date: '2025-04-10',
            categories: ['AI', '开源'],
            tags: ['AI', '大模型', 'LLaMA', 'LoRA', '部署'],
            content: `<p>随着大语言模型（LLM）的开源生态日益成熟，打造一个属于自己的AI助手不再是遥不可及的梦想。本文将分享从模型选择到部署上线的完整流程。</p>
<h2>一、模型选择</h2>
<p>当前主流的开源LLM包括：</p>
<ul>
    <li><strong>LLaMA 系列（Meta）</strong>：LLaMA 2/3 是性能最强的开源基础模型之一，社区生态丰富。</li>
    <li><strong>Qwen 系列（阿里）</strong>：通义千问的开源版本，中文能力出色，支持多尺寸选择。</li>
    <li><strong>DeepSeek 系列</strong>：国产开源模型的佼佼者，代码和数学能力突出。</li>
    <li><strong>ChatGLM 系列</strong>：智谱AI开源的对话模型，中文对话体验优秀。</li>
    <li><strong>Mistral / Mixtral</strong>：欧洲团队开发的高效模型，MoE架构表现出色。</li>
</ul>
<p>选择建议：如果需要强大的中文能力，优先考虑 Qwen 或 DeepSeek；如果追求社区生态和通用性，LLaMA 系列是最佳选择。</p>
<h2>二、硬件需求</h2>
<p>运行大模型对硬件有一定要求：</p>
<ul>
    <li><strong>7B 模型（FP16）</strong>：约需要 14GB 显存，如 RTX 3080/4070（12GB需用量化）。</li>
    <li><strong>7B 模型（INT4量化）</strong>：约需要 6GB 显存，RTX 3060 即可运行。</li>
    <li><strong>13B 模型（INT4）</strong>：约需要 10GB 显存，RTX 4070 可流畅运行。</li>
    <li><strong>70B 模型</strong>：需要多卡或云端部署，如 2×A100。</li>
</ul>
<p>没有高端GPU也可以使用 CPU 推理（速度较慢）或租用云端GPU（如AutoDL、Google Colab Pro）。</p>
<h2>三、推理部署框架</h2>
<ul>
    <li><strong>llama.cpp</strong>：C++实现的轻量推理框架，支持CPU和GPU混合推理，量化支持极好。</li>
    <li><strong>vLLM</strong>：高性能推理引擎，PagedAttention技术大幅提升吞吐量，适合生产环境。</li>
    <li><strong>Ollama</strong>：一键部署工具，几行命令即可运行模型，适合个人用户。</li>
    <li><strong>Transformers + Hugging Face</strong>：PyTorch原生方式，灵活性最高。</li>
</ul>
<p>推荐个人用户使用 <strong>Ollama</strong> 快速上手，开发者使用 <strong>vLLM</strong> 构建服务。</p>
<h2>四、模型微调（LoRA）</h2>
<p>如果想让AI助手具备特定领域知识或个性化风格，需要进行微调。LoRA（Low-Rank Adaptation）是目前最高效的微调方法：</p>
<ul>
    <li>在预训练权重旁添加低秩矩阵，只训练这些新增参数。</li>
    <li>训练参数量仅为原始模型的 0.1%~1%，显存需求大幅降低。</li>
    <li>可叠加多个 LoRA 模块，灵活组合不同能力。</li>
</ul>
<p>常用工具：<strong>LLaMA-Factory</strong>（国产开源，支持可视化界面）、<strong>PEFT库</strong>（Hugging Face官方）。</p>
<h2>五、构建对话界面</h2>
<p>部署完模型后，需要一个友好的前端界面。推荐方案：</p>
<ul>
    <li><strong>Open WebUI</strong>：开源的类ChatGPT界面，支持Ollama等后端，功能完善。</li>
    <li><strong>自建Web界面</strong>：使用Next.js/Vue + FastAPI构建定制化界面。</li>
    <li><strong>API服务</strong>：将模型封装为REST API（如使用FastAPI+vLLM），供其他应用调用。</li>
</ul>
<h2>六、总结</h2>
<p>打造个人AI助手的门槛正在不断降低。从模型选择到部署上线，开源社区提供了丰富的工具链。即使是个人开发者，也能在普通硬件上运行一个可用的AI助手。关键在于根据自己的需求选择合适的模型和部署方案。</p>`
        },
        {
            id: 4,
            title: '从零搭建炫酷个人博客：技术选型与实现',
            date: '2025-03-01',
            categories: ['博客指南'],
            tags: ['博客搭建', 'HTML', 'CSS', 'JavaScript', '静态站点'],
            content: `<p>作为技术人员，拥有一个个人博客不仅是展示自己的窗口，也是知识沉淀的最佳方式。本文将分享搭建个人博客的完整思路。</p>
<h2>一、为什么选择静态站点</h2>
<p>相比WordPress等动态博客系统，静态站点有以下优势：</p>
<ul>
    <li><strong>速度快</strong>：纯HTML文件，无需数据库查询，加载速度极快。</li>
    <li><strong>安全</strong>：没有后台管理系统，攻击面极小。</li>
    <li><strong>成本低</strong>：可以免费部署在GitHub Pages、Vercel、Cloudflare Pages等平台。</li>
    <li><strong>版本控制</strong>：所有内容使用Git管理，方便回溯和协作。</li>
    <li><strong>可定制</strong>：完全掌控HTML/CSS/JS，可以打造独一无二的风格。</li>
</ul>
<h2>二、技术选型</h2>
<p>搭建静态博客有多种技术方案：</p>
<ul>
    <li><strong>纯HTML/CSS/JS</strong>：最基础的方式，无需任何构建工具。适合小型博客或学习项目。本博客即采用这种方式。</li>
    <li><strong>静态站点生成器（SSG）</strong>：如 Astro、Hugo、Hexo、Jekyll。使用Markdown编写文章，自动生成静态页面。推荐 <strong>Astro</strong>，性能出色且支持多框架组件。</li>
    <li><strong>现代框架</strong>：如 Next.js、Nuxt.js 的静态导出模式。适合复杂交互需求。</li>
</ul>
<p>选择建议：<strong>初学者从纯HTML/CSS开始</strong>，理解Web基础；进阶后使用<strong>Astro或Hugo</strong>大幅提升效率。</p>
<h2>三、设计风格</h2>
<p>本博客的设计风格特点：</p>
<ul>
    <li>深色主题 + 紫色主色调，营造科技感氛围。</li>
    <li>毛玻璃效果，卡片式布局。</li>
    <li>粒子动画、打字机效果、故障文字等视觉特效。</li>
    <li>全宽 Banner + 背景视频，视觉冲击力强。</li>
    <li>银狼角色主题，融合星穹铁道设计元素。</li>
</ul>
<h2>四、动效设计</h2>
<p>好的动效能提升用户体验，但不宜过多：</p>
<ul>
    <li><strong>滚动渐显动画</strong>：使用 Intersection Observer API 实现，性能好于 scroll 事件监听。</li>
    <li><strong>粒子背景</strong>：使用 Canvas 绘制，注意控制粒子数量避免性能问题。</li>
    <li><strong>毛玻璃导航栏</strong>：使用 CSS backdrop-filter，滚动时增加阴影。</li>
    <li><strong>微交互</strong>：hover 时的轻微缩放、位移，使用 spring 缓动函数更自然。</li>
</ul>
<h2>五、部署与维护</h2>
<ul>
    <li><strong>GitHub Pages</strong>：免费且与GitHub仓库深度集成，推荐个人博客使用。</li>
    <li><strong>Vercel</strong>：部署速度快，支持自动HTTPS和自定义域名，对静态站点友好。</li>
    <li><strong>Cloudflare Pages</strong>：全球CDN加速，中国大陆访问速度较好。</li>
</ul>
<p>建议使用GitHub Actions实现推送代码即自动部署的CI/CD流程。</p>
<h2>六、总结</h2>
<p>搭建个人博客是一次很好的技术实践。从技术选型到部署上线，每一步都能学到新东西。最重要的是——开始写，持续更新。博客的价值在于内容，而非花哨的技术。</p>`
        },
        {
            id: 5,
            title: '技术人的马拉松：代码与跑步的双重人生',
            date: '2025-02-14',
            categories: ['随笔'],
            tags: ['马拉松', '跑步', '生活', '随笔'],
            content: `<p>作为一名程序员，我在键盘前度过了无数个日夜。但还有另一面——我是一名马拉松爱好者。跑步和写代码，看似风马牛不相及，却有着惊人的相似之处。</p>
<h2>一、坚持：最重要的品质</h2>
<p>写代码需要坚持。一个Bug可能要调试几天，一个功能可能要迭代数周。跑步同样如此——全马42.195公里的距离，不可能一蹴而就。</p>
<p>我的训练计划从每周30公里开始，逐步增加到60公里。这个过程需要耐心和自律，就像学习一门新技术：从Hello World到能独立完成项目，中间是无数个小时的练习和调试。</p>
<h2>二、策略：找到最优解</h2>
<p>跑马拉松讲究配速策略：起跑不能太快（否则后程会崩），也不能太慢（达不到目标成绩）。这就像项目中的资源分配——哪些功能优先完成，哪些任务可以延后。</p>
<p>我的马拉松PB（个人最佳成绩）是3小时45分钟，配速稳定在5分20秒/公里。这个节奏是我经过多次训练和比赛才找到的"最优解"。</p>
<h2>三、工具：磨刀不误砍柴功</h2>
<p>程序员有IDE、版本控制、调试工具；跑者有跑鞋、GPS手表、心率带。选择合适的工具能让效率翻倍：</p>
<ul>
    <li><strong>跑鞋</strong>：碳板跑鞋（如Nike Vaporfly）能在比赛中省力4%左右——这就像选择正确的框架能省去大量重复代码。</li>
    <li><strong>手表</strong>：Garmin的运动手表能实时监测心率、配速、步频，就像IDE的实时语法检查。</li>
    <li><strong>营养</strong>：比赛中每5公里补一次能量胶，就像编程时定时休息喝水——保持状态的关键。</li>
</ul>
<h2>四、社区：一起成长</h2>
<p>编程社区（GitHub、Stack Overflow、技术群）和跑步社区（跑团、马拉松群）都能带来意想不到的价值：</p>
<blockquote>"如果你想走得快，就一个人走；如果你想走得远，就一起走。"</blockquote>
<p>我加入了学校的羽毛球和足球社团，也加入了本地的跑步俱乐部。每周的团跑训练不仅是体能锻炼，也是社交和交流的机会。</p>
<h2>五、复盘：从失败中学习</h2>
<p>每次跑完比赛，我都会复盘：哪个阶段的配速有问题？补给是否及时？心态是否有波动？这就像代码Review——找到问题，下次改进。</p>
<p>第一次跑全马时，我在35公里处遭遇了著名的"撞墙期"，配速从5分30秒骤降到7分钟。后来我调整了补给策略和LSD（长距离慢跑）训练，第二次比赛就顺利多了。</p>
<h2>六、平衡：代码与跑道</h2>
<p>久坐编程对身体的伤害是实实在在的。跑步不仅是锻炼身体，更是给大脑"刷新"的机会。我通常在傍晚跑步，5-10公里的慢跑后，白天卡住的编程问题常常能豁然开朗。</p>
<p>如果你也是一名程序员，不妨尝试跑步。不需要跑马拉松，哪怕是每周2-3次3公里的慢跑，也能让你感受到身体和大脑的积极变化。</p>
<p>代码有bug可以debug，身体出了问题却很难"回滚"。保持健康的身体，才能写出更好的代码。</p>`
        },
        {
            id: 6,
            title: '博客开篇：我的技术之旅',
            date: '2024-12-08',
            categories: ['随笔'],
            tags: ['博客', '随笔', '开源'],
            content: `<p>2024年12月8日，我决定开始写博客。</p>
<h2>一、为什么要写博客</h2>
<p>学习编程这几年，我深刻体会到"学过的知识如果不记录，就等于没学"。很多技术细节当时记得清清楚楚，但几个月后回头再看，只能想起一个模糊的轮廓。</p>
<p>写作是整理思维的最好方式。把一个复杂的概念用清晰的语言表达出来，这个过程本身就是一次深度学习。</p>
<h2>二、我的技术背景</h2>
<p>我是一名计算机网络专业的学生，目前专注于以下领域：</p>
<ul>
    <li><strong>AI / 深度学习</strong>：正在系统学习PyTorch和TensorFlow，对Transformer架构和LLM特别感兴趣。</li>
    <li><strong>C++ / Python</strong>：C++是我的主力语言，喜欢它强大的性能和灵活性；Python用于深度学习和快速原型开发。</li>
    <li><strong>开源</strong>：我的所有项目都在 GitHub 和 Gitee 上开源，欢迎交流。</li>
</ul>
<h2>三、博客的内容规划</h2>
<p>这个博客将主要涵盖以下内容：</p>
<ul>
    <li>技术教程和实战经验分享</li>
    <li>AI / 深度学习的学习笔记</li>
    <li>C++ 和 Python 的编程技巧</li>
    <li>开源项目介绍和工具推荐</li>
    <li>学习和生活中的随笔感悟</li>
</ul>
<h2>四、技术之外</h2>
<p>除了编程，我还热爱 ACG（动画、漫画、游戏）、户外运动、羽毛球、足球和马拉松。这些爱好让我在代码之外找到了生活的平衡。</p>
<p>我特别喜欢星穹铁道中的银狼——一个自信又带点傲娇的超级骇客。她的风格就是我的风格：用最简洁的代码实现最酷的功能。</p>
<p>正如银狼所说：</p>
<blockquote>「有时候只需要换个角度看问题，一切都不一样了。」</blockquote>
<p>欢迎来到我的世界。</p>`
        }
    ];

    const postModal = document.getElementById('postModal');
    const postModalBackdrop = document.getElementById('postModalBackdrop');
    const postModalClose = document.getElementById('postModalClose');
    const postModalBody = document.getElementById('postModalBody');

    function openPostModal(post) {
        if (!postModal || !postModalBody) return;
        postModalBody.innerHTML = `
            <div class="post-detail-header">
                <h1 class="post-detail-title">${post.title}</h1>
                <div class="post-detail-meta">
                    <span>${post.date}</span>
                    ${post.categories.map(c => '<span class="meta-tag">' + c + '</span>').join('')}
                    <span>· ${post.tags.length} 个标签</span>
                </div>
            </div>
            <div class="post-detail-content">${post.content}</div>
        `;
        postModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        postModalBody.scrollTop = 0;
    }
    function closePostModal() {
        if (!postModal) return;
        postModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (postModalBackdrop) postModalBackdrop.addEventListener('click', closePostModal);
    if (postModalClose) postModalClose.addEventListener('click', closePostModal);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && postModal && postModal.classList.contains('open')) closePostModal();
    });

    /* 阻止文章卡片内所有链接的默认跳转行为 */
    document.querySelectorAll('.post-card a').forEach(a => {
        a.addEventListener('click', e => e.preventDefault());
    });

    /* 为文章卡片绑定点击事件 */
    const postCards = document.querySelectorAll('.post-card');
    postCards.forEach((card, index) => {
        if (index < blogPosts.length) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => openPostModal(blogPosts[index]));
        }
    });

    /* 归档文章链接绑定 */
    const archiveItems = document.querySelectorAll('.archive-item');
    archiveItems.forEach((item, index) => {
        if (index < blogPosts.length) {
            item.href = 'javascript:void(0)';
            item.addEventListener('click', e => {
                e.preventDefault();
                openPostModal(blogPosts[index]);
            });
        }
    });

})();