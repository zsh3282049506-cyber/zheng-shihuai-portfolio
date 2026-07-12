import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowDown,
  ArrowUpRight,
  Box,
  ChevronRight,
  CircleGauge,
  Download,
  Mail,
  Move3d,
  Phone,
  Ruler,
  Settings,
} from 'lucide-react'
import Ferrofluid from './components/Ferrofluid'
import BorderGlow from './components/BorderGlow'
import DeferredVideo from './components/DeferredVideo'
import PillNav from './components/PillNav'

gsap.registerPlugin(ScrollTrigger)

const ferrofluidColors = ['#000000', '#ffffff', '#ffffff']
const experienceGlowColors = ['#d9ff43', '#f2f3ef', '#6f777a']
const assetVersion = '20260712-2'
const assetUrl = (fileName) => `${import.meta.env.BASE_URL}assets/${fileName}?v=${assetVersion}`
const navigationItems = [
  { label: '关于', href: '#profile' },
  { label: '项目', href: '#projects' },
  { label: '能力', href: '#strengths' },
  { label: '联系', href: '#contact' },
]

const projects = [
  {
    index: '01',
    title: '单轴驱动凸轮式 PPU 机械手的设计与开发',
    subtitle: '非标高速搬运机构 / 独立主导',
    period: '2026.03 — 2026.05',
    media: {
      src: assetUrl('ppu-motion.mp4'),
      label: 'PPU 机械手运行演示',
      gallery: [
        { type: 'image', src: assetUrl('ppu-assembly-front.png'), label: '正视结构模型' },
        { type: 'image', src: assetUrl('ppu-assembly-rear.png'), label: '侧后结构模型' },
      ],
    },
    summary:
      '面向锂电池电芯高速、高精度搬运需求，设计单轴驱动凸轮式 PPU 机械手，以机械物理耦合替代多轴伺服协同，降低多轴联动的信号滞后影响。采用自上而下参数化建模，构建垂直反装与水平双轨四滑块的高刚性导向布局，并通过可调凸轮槽微调机构补偿加工误差，兼顾装配精度、加工成本与调试效率。',
    facts: ['50 pcs/min 高节拍', '±0.02mm 定位精度', 'Hermite 凸轮曲线', '双轨四滑块导向'],
  },
  {
    index: '02',
    title: '新型齿轮齿条传动平台',
    subtitle: '高精度纯滚动传动 / 项目负责人',
    period: '2024.04 — 2024.11',
    media: {
      layout: 'grouped',
      images: [
        { src: assetUrl('rack-platform.png'), label: '传动平台模型' },
        { src: assetUrl('rack-gear-profile.png'), label: '齿廓与齿条模型' },
      ],
      videos: [
        { src: assetUrl('rack-exploded.mp4'), label: '齿轮齿条爆炸视图', className: 'project-gallery-item--exploded' },
        { src: assetUrl('rack-motion.mp4'), label: '纯滚动运行演示', className: 'project-gallery-item--running' },
      ],
    },
    summary:
      '围绕自动化搬运的高精度位移需求，主导创新型齿轮齿条传动平台的传动架构建立，并完成理论建模、实物加工、装配调试与五次样机迭代。以“抛物线-双曲线”专利为基础研发纯滚动传动机构，结合 Matlab 优化 Hermite 齿根，消除换向冲击与系统振动，提升传动精度、耐磨性与使用寿命。',
    facts: ['纯滚动传动机构', '五次样机迭代', '全国一等奖', '8 套意向合同'],
  },
]

const strengths = [
  {
    icon: Box,
    number: '01',
    title: '结构设计闭环',
    text: '熟练使用 SolidWorks 完成三维建模、工程图、干涉检查与装配验证，从方案到样机保持设计一致性。',
    meta: 'SolidWorks / 工程图 / DFM',
  },
  {
    icon: CircleGauge,
    number: '02',
    title: '仿真与优化',
    text: '掌握 Ansys 结构仿真和受力分析，并结合 Matlab 优化齿廓曲线，以量化结果验证结构改进。',
    meta: 'Ansys / Matlab / 结构分析',
  },
  {
    icon: Settings,
    number: '03',
    title: '自动化现场认知',
    text: '具备比亚迪自动化产线实践，理解气动控制、设备时序、机械臂工位逻辑与生产节拍。',
    meta: '气动系统 / 动作时序 / 调试',
  },
  {
    icon: Move3d,
    number: '04',
    title: '工程表达能力',
    text: '能够使用 SolidWorks Composer 制作工业动画与产品展示视频，让复杂机构的运动逻辑清晰可见。',
    meta: 'Composer / 工业动画 / 演示',
  },
]

function App() {
  const appRef = useRef(null)
  const [headerPinned, setHeaderPinned] = useState(false)
  const [activeHref, setActiveHref] = useState('')

  useEffect(() => {
    let animationFrame = 0

    const updateHeader = () => {
      const hero = document.getElementById('top')
      const pinPoint = hero ? hero.offsetTop + hero.offsetHeight - 1 : window.innerHeight
      const nextPinned = window.scrollY >= pinPoint
      setHeaderPinned((current) => (current === nextPinned ? current : nextPinned))

      const currentSection = navigationItems.reduce((closest, item) => {
        const section = document.querySelector(item.href)
        if (!section || section.offsetTop > window.scrollY + window.innerHeight * 0.42) return closest
        return item.href
      }, '')
      setActiveHref((current) => (current === currentSection ? current : currentSection))
    }

    const requestHeaderUpdate = () => {
      if (animationFrame) return
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0
        updateHeader()
      })
    }

    requestHeaderUpdate()
    window.addEventListener('scroll', requestHeaderUpdate, { passive: true })
    window.addEventListener('resize', requestHeaderUpdate)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', requestHeaderUpdate)
      window.removeEventListener('resize', requestHeaderUpdate)
    }
  }, [])

  useLayoutEffect(() => {
    const refreshScrollTriggers = () => ScrollTrigger.refresh()
    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } })

      gsap.set('.hero-opening-mask', { transformOrigin: 'top center' })
      gsap.set('.hero-video', { autoAlpha: 0, scale: 1.14 })
      gsap.set('.site-header', { autoAlpha: 0, y: -72 })

      intro
        .to('.hero-video', { autoAlpha: 1, scale: 1, duration: 2.2 }, 0)
        .to('.hero-opening-mask', { scaleY: 0, duration: 1.65, ease: 'power4.inOut' }, 0.12)
        .to('.site-header', { autoAlpha: 1, y: 0, duration: 1.05 }, 0.5)
        .from('.hero-status', { autoAlpha: 0, y: 34, duration: 0.95 }, 0.75)
        .from('.hero-name', { autoAlpha: 0, x: -38, duration: 0.9 }, 0.92)
        .from('.hero-title-line > span', {
          autoAlpha: 0,
          yPercent: 118,
          scaleY: 0.58,
          transformOrigin: 'bottom center',
          duration: 1.55,
          stagger: 0.17,
        }, 0.94)
        .from('.hero-bottom', { autoAlpha: 0, y: 54, duration: 1.15 }, 1.4)
        .from('.coordinate', { autoAlpha: 0, x: 24, duration: 0.8, stagger: 0.12 }, 1.5)

      const animateHeading = (section) => {
        const word = section.querySelector('[data-section-word]')
        const title = section.querySelector('[data-section-title]')
        const eyebrow = section.querySelector('[data-section-eyebrow]')
        if (!title) return

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 76%',
            once: true,
          },
          defaults: { ease: 'expo.out' },
        })

        if (word) {
          timeline.fromTo(word, {
            autoAlpha: 0,
            xPercent: -18,
            scaleX: 0.55,
            transformOrigin: 'left center',
          }, {
            autoAlpha: 0.16,
            xPercent: 0,
            scaleX: 1,
            duration: 1.7,
          })
        }

        timeline.fromTo(title, {
          autoAlpha: 0,
          yPercent: 120,
          scaleY: 0.65,
          clipPath: 'inset(0 0 100% 0)',
          transformOrigin: 'bottom center',
        }, {
          autoAlpha: 1,
          yPercent: 0,
          scaleY: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.35,
        }, word ? '-=1.15' : 0)

        if (eyebrow) {
          timeline.from(eyebrow, { autoAlpha: 0, x: -30, duration: 0.8 }, '-=1.02')
        }
      }

      gsap.utils.toArray('[data-motion-section]').forEach(animateHeading)

      const profile = document.querySelector('#profile')
      if (profile) {
        gsap.from(profile.querySelectorAll('[data-profile-item]'), {
          autoAlpha: 0,
          y: 90,
          scale: 0.94,
          duration: 1.25,
          stagger: 0.2,
          ease: 'power4.out',
          scrollTrigger: { trigger: profile, start: 'top 53%', once: true },
        })

        const experience = profile.querySelector('.experience-panel')
        if (experience) {
          gsap.from(experience, {
            autoAlpha: 0,
            y: 100,
            duration: 1.3,
            ease: 'power4.out',
            scrollTrigger: { trigger: experience, start: 'top 80%', once: true },
          })
          gsap.from(experience.querySelectorAll('.experience-glow-card'), {
            autoAlpha: 0,
            y: 72,
            scale: 0.96,
            duration: 1.1,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: experience.querySelector('.experience-cards'), start: 'top 84%', once: true },
          })
        }

        const records = profile.querySelector('.engineering-records')
        if (records) {
          gsap.from(records.querySelectorAll('.record-list article'), {
            autoAlpha: 0,
            x: -70,
            duration: 0.95,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: records, start: 'top 82%', once: true },
          })
        }
      }

      const projectsSection = document.querySelector('#projects')
      if (projectsSection) {
        gsap.utils.toArray(projectsSection.querySelectorAll('[data-project-card]')).forEach((card) => {
          const media = card.querySelector('.project-media')
          const featureMedia = card.querySelector('.project-feature-media')
          const content = card.querySelector('.project-content')
          const timeline = gsap.timeline({
            scrollTrigger: { trigger: card, start: 'top 78%', once: true },
            defaults: { ease: 'power4.out' },
          })

          timeline
            .from(card, { autoAlpha: 0, y: 130, scale: 0.95, duration: 1.35 })
            .fromTo(media, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.35 }, '-=0.88')
            .fromTo(featureMedia, { scale: 1.22 }, { scale: 1.08, duration: 1.7 }, '<')
            .from(content.children, { autoAlpha: 0, y: 48, duration: 0.9, stagger: 0.12 }, '-=0.82')

          gsap.fromTo(featureMedia, { yPercent: -7, scale: 1.1 }, {
            yPercent: 7,
            scale: 1.1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.9,
            },
          })
        })
      }

      const strengths = document.querySelector('#strengths')
      if (strengths) {
        gsap.from(strengths.querySelectorAll('[data-strength-card]'), {
          autoAlpha: 0,
          y: 110,
          scale: 0.92,
          rotationX: 7,
          transformPerspective: 900,
          transformOrigin: 'center bottom',
          duration: 1.15,
          stagger: { each: 0.16, from: 'start' },
          ease: 'power4.out',
          scrollTrigger: { trigger: strengths.querySelector('.strength-grid'), start: 'top 76%', once: true },
        })
      }

      const contact = document.querySelector('#contact')
      if (contact) {
        gsap.from(contact.querySelectorAll('[data-contact-item]'), {
          autoAlpha: 0,
          y: 85,
          duration: 1.15,
          stagger: 0.16,
          ease: 'power4.out',
          scrollTrigger: { trigger: contact, start: 'top 72%', once: true },
        })
      }

      refreshScrollTriggers()
    }, appRef)

    window.addEventListener('load', refreshScrollTriggers)

    return () => {
      window.removeEventListener('load', refreshScrollTriggers)
      context.revert()
    }
  }, [])

  return (
    <div className="site-shell" ref={appRef}>
      <header className={`site-header ${headerPinned ? 'is-pinned' : ''}`}>
        <PillNav items={navigationItems} activeHref={activeHref} />

        <a className="header-contact" href="mailto:3282049506@qq.com">
          <span>发起联系</span>
          <ArrowUpRight size={17} strokeWidth={1.8} />
        </a>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-opening-mask" aria-hidden="true" />
          <DeferredVideo
            className="hero-video"
            src={assetUrl('hero-machinery.mp4')}
            label="首屏机械运行演示"
            poster={assetUrl('project-automation.jpg')}
            ariaHidden
            eager
          />
          <div className="hero-shade" />
          <div className="hero-grid" aria-hidden="true" />
          <span className="coordinate coordinate-a">X 23.41 / Y 07.18</span>
          <span className="coordinate coordinate-b">GDOU / ME 2027</span>

          <div className="hero-inner content-frame">
            <div className="hero-status">
              <span className="status-dot" />
              2027 届 · 寻找机械设计工程师机会
            </div>
            <div className="hero-title-wrap">
              <p className="hero-name">郑世怀 / ZHENG SHIHUAI</p>
              <h1>
                <span className="hero-title-line hero-title-line--solid"><span>机械设计</span></span>
                <span className="hero-title-line hero-title-line--outline"><span>工程师</span></span>
              </h1>
            </div>
            <div className="hero-bottom">
              <p>
                聚焦非标自动化与精密传动，<br />
                让每一次运动都可计算、可验证、可落地。
              </p>
              <a className="primary-link" href="#projects">
                查看精选项目
                <ArrowDown size={18} strokeWidth={1.8} />
              </a>
            </div>
          </div>
        </section>

        <div className="below-hero">
          <div className="ferrofluid-backdrop" aria-hidden="true">
            <Ferrofluid
              className="portfolio-ferrofluid"
              colors={ferrofluidColors}
              backgroundColor="#090b0d"
              speed={0.4}
              scale={2}
              turbulence={1.45}
              fluidity={0.15}
              rimWidth={0.19}
              sharpness={3}
              shimmer={1.35}
              glow={2}
              flowDirection="up"
              opacity={0.9}
              mouseInteraction
              mouseStrength={1}
              mouseRadius={0.55}
              mouseDampening={0.18}
              dpr={1}
              frameRate={24}
              renderScale={0.72}
            />
          </div>

          <section className="profile section" id="profile" data-motion-section>
          <div className="content-frame">
            <div className="section-heading">
              <p className="eyebrow" data-section-eyebrow><span>01</span> 关于我</p>
              <div className="heading-title-wrap">
                <span className="section-display-word" data-section-word aria-hidden="true">PROFILE</span>
                <h2 data-section-title>从结构逻辑出发，<br />把设计推进到实物。</h2>
              </div>
            </div>

            <div className="profile-layout">
              <figure className="portrait-block" data-profile-item>
                <div className="portrait-frame">
                  <img src={assetUrl('portrait.jpg')} alt="机械设计工程师郑世怀" loading="lazy" decoding="async" />
                  <span className="portrait-corner corner-tl" />
                  <span className="portrait-corner corner-br" />
                </div>
                <figcaption>
                  <span>ZS / 2026</span>
                  <span>广东海洋大学</span>
                </figcaption>
              </figure>

              <div className="profile-copy" data-profile-item>
                <p className="lead">
                  我是郑世怀，广东海洋大学机械设计制造及其自动化专业本科生，具备非标自动化项目实践基础，专注于结构设计、精密传动与工程验证。
                </p>
                <p>
                  熟练使用 SolidWorks 完成建模和工程图绘制，掌握 Ansys 结构仿真与受力分析优化；了解气动与机械传动原理，熟悉标准件选型。比亚迪生产一线的设备实践，也让我更关注节拍、可靠性与维护效率，而不只是一张完成的工程图。
                </p>

                <div className="contact-list">
                  <a href="tel:13802331718">
                    <Phone size={17} />
                    <span>138 0233 1718</span>
                    <ArrowUpRight size={16} />
                  </a>
                  <a href="mailto:3282049506@qq.com">
                    <Mail size={17} />
                    <span>3282049506@qq.com</span>
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>

            </div>

            <div className="experience-panel">
              <div className="experience-heading">
                <p className="eyebrow"><span>EX</span> 实践经历</p>
                <p>从生产现场理解设备动作、工艺参数与结构可靠性。</p>
              </div>

              <div className="experience-cards">
                <BorderGlow
                  className="experience-glow-card experience-glow-card--feature"
                  edgeSensitivity={24}
                  glowColor="75 100 63"
                  backgroundColor="#101316"
                  borderRadius={4}
                  glowRadius={28}
                  glowIntensity={0.85}
                  coneSpread={20}
                  animated
                  colors={experienceGlowColors}
                  fillOpacity={0.12}
                >
                  <article className="experience-feature">
                    <div className="experience-meta">
                      <time>2024.06 — 2024.09</time>
                      <strong>汕头比亚迪实业有限公司</strong>
                      <span>自动化产线 · 设备调试 · 气动系统</span>
                    </div>
                    <div className="experience-body">
                      <h3>设备助理工程师实习生</h3>
                      <p>
                        深入电池装配自动化生产一线，参与设备调试、工艺参数管控与异常分析，从现场视角理解非标机械结构的合理性和可靠性。
                      </p>
                      <ul>
                        <li>参与电池装配自动化产线日常运行维护，理解机械臂工位作业逻辑与设备动作时序。</li>
                        <li>负责机械臂点胶、压紧及保压工艺操作，通过压力参数管控保障装配精度和生产节拍。</li>
                        <li>掌握手拉阀与旋转压紧气缸的使用，根据工艺需求调整动作顺序与气压参数。</li>
                        <li>协助工程师完成设备维护与调试，分析异常原因并提出改进建议。</li>
                        <li>观察生产线节拍逻辑、设备动作时序及气动元件布局，积累自动化装备应用经验。</li>
                      </ul>
                    </div>
                  </article>
                </BorderGlow>

                <BorderGlow
                  className="experience-glow-card experience-glow-card--education"
                  edgeSensitivity={24}
                  glowColor="75 100 63"
                  backgroundColor="#101316"
                  borderRadius={4}
                  glowRadius={28}
                  glowIntensity={0.85}
                  coneSpread={20}
                  animated
                  colors={experienceGlowColors}
                  fillOpacity={0.12}
                >
                  <article className="education-row">
                    <div>
                      <time>2023.09 — 2027.06</time>
                      <span>教育背景</span>
                    </div>
                    <h3>机械设计制造及其自动化</h3>
                    <p>广东海洋大学 · 本科 · CET-4 · 机械原理、机械设计、机械制造技术基础等</p>
                  </article>
                </BorderGlow>
              </div>
            </div>

            <div className="engineering-records">
              <div className="records-heading">
                <p>工程记录 / RECORDS</p>
                <span>用项目过程与验证结果描述能力，而不是孤立的数字。</span>
              </div>
              <div className="record-list">
                <article>
                  <span className="record-index">R.01</span>
                  <div><h3>完整研发闭环</h3><p>独立主导两项机械项目，覆盖方案、建模、选型与验证。</p></div>
                  <strong>2 项</strong>
                </article>
                <article>
                  <span className="record-index">R.02</span>
                  <div><h3>样机迭代验证</h3><p>通过实物加工、组装和调试持续修正传动方案。</p></div>
                  <strong>5 轮</strong>
                </article>
                <article>
                  <span className="record-index">R.03</span>
                  <div><h3>高速搬运精度</h3><p>凸轮式 PPU 机械手采用高刚性导向布局，完成柔性真空吸盘与伺服电机的力学计算及选型。</p></div>
                  <strong>±0.02mm</strong>
                </article>
                <article>
                  <span className="record-index">R.04</span>
                  <div><h3>项目成果认可</h3><p>齿轮齿条传动平台获第十届全国应用型人才综合技能大赛全国一等奖，并签订 8 套意向合同。</p></div>
                  <strong>全国一等奖</strong>
                </article>
              </div>
            </div>
          </div>
          </section>

          <section className="projects section" id="projects" data-motion-section>
          <div className="content-frame">
            <div className="section-heading projects-heading">
              <p className="eyebrow" data-section-eyebrow><span>02</span> 精选项目</p>
              <div className="heading-title-wrap">
                <span className="section-display-word" data-section-word aria-hidden="true">WORKS</span>
                <h2 data-section-title>设计不是造型，<br />是约束下的最优解。</h2>
              </div>
              <p className="heading-note">从传动架构到装配验证，记录两次完整的工程实践。</p>
            </div>

            <div className="project-list">
              {projects.map((project) => (
                <article className="project-card" key={project.index} data-project-card>
                  {project.media.layout === 'grouped' ? (
                    <div className="project-media project-media--grouped">
                      <section className="project-media-group project-media-group--images">
                        <div className="project-media-group-heading">
                          <span>设计模型</span>
                          <strong>{project.index}</strong>
                        </div>
                        <div className="project-media-group-grid">
                          {project.media.images.map((item) => (
                            <figure className="project-gallery-item" key={item.src}>
                              <img src={item.src} alt={`${project.title}${item.label}`} loading="lazy" decoding="async" />
                              <figcaption>{item.label}</figcaption>
                            </figure>
                          ))}
                        </div>
                      </section>
                      <section className="project-media-group project-media-group--videos">
                        <div className="project-media-group-heading">
                          <span>循环演示</span>
                          <strong>LOOP</strong>
                        </div>
                        <div className="project-media-group-grid">
                          {project.media.videos.map((item, index) => (
                            <figure className={`project-gallery-item project-gallery-item--video ${item.className}`} key={item.src}>
                              <DeferredVideo className={index === 0 ? 'project-feature-media' : ''} src={item.src} poster={item.poster ?? assetUrl('project-gears.jpg')} label={item.label} />
                              <figcaption>{item.label}</figcaption>
                            </figure>
                          ))}
                        </div>
                      </section>
                    </div>
                  ) : (
                    <div className="project-media">
                      <div className="project-media-feature">
                        <DeferredVideo className="project-feature-media" src={project.media.src} poster={assetUrl('project-automation.jpg')} label={project.media.label} />
                        <div className="project-media-overlay" />
                        <span className="project-media-label">循环视频 / {project.media.label}</span>
                        <span className="project-index">{project.index}</span>
                      </div>
                      <div className="project-gallery">
                        {project.media.gallery.map((item) => (
                          <figure className={`project-gallery-item project-gallery-item--${item.type}`} key={item.src}>
                            {item.type === 'video' ? (
                              <DeferredVideo src={item.src} poster={assetUrl('project-automation.jpg')} label={item.label} />
                            ) : (
                              <img src={item.src} alt={`${project.title}${item.label}`} loading="lazy" decoding="async" />
                            )}
                            <figcaption>{item.label}</figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="project-content">
                    <div className="project-meta">
                      <span>{project.subtitle}</span>
                      <time>{project.period}</time>
                    </div>
                    <div className="project-title-row">
                      <h3>{project.title}</h3>
                      <span className="project-icon" aria-hidden="true"><ArrowUpRight /></span>
                    </div>
                    <p>{project.summary}</p>
                    <ul>
                      {project.facts.map((fact) => <li key={fact}>{fact}</li>)}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
          </section>

          <section className="strengths section" id="strengths" data-motion-section>
          <div className="content-frame strengths-layout">
            <div className="strengths-intro">
              <p className="eyebrow" data-section-eyebrow><span>03</span> 个人优势</p>
              <div className="heading-title-wrap">
                <span className="section-display-word" data-section-word aria-hidden="true">CAPABILITIES</span>
                <h2 data-section-title>从参数到现场，<br />保持工程判断。</h2>
              </div>
              <p>能力不仅是会用工具，更是知道何时、为什么使用它。</p>
            </div>

            <div className="strength-grid">
              {strengths.map(({ icon: Icon, ...item }) => (
                <article className="strength-card" key={item.number} data-strength-card>
                  <div className="strength-top">
                    <Icon size={28} strokeWidth={1.45} />
                    <span>{item.number}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <div className="strength-meta">
                    <Ruler size={15} />
                    {item.meta}
                  </div>
                </article>
              ))}
            </div>
          </div>
          </section>
        </div>

        <section className="contact-section" id="contact" data-motion-section>
          <DeferredVideo
            className="contact-video"
            src={assetUrl('hero-machinery.mp4')}
            label="联系页机械运行演示"
            poster={assetUrl('project-automation.jpg')}
            ariaHidden
          />
          <div className="contact-video-shade" aria-hidden="true" />
          <div className="contact-grid" aria-hidden="true" />
          <div className="contact-inner content-frame">
            <p className="eyebrow" data-section-eyebrow><span>04</span> 联系我</p>
            <div className="contact-title">
              <p>有合适的机械设计岗位或项目？</p>
              <div className="heading-title-wrap">
                <span className="section-display-word" data-section-word aria-hidden="true">CONTACT</span>
                <h2 data-section-title>让结构，<br />开始工作。</h2>
              </div>
            </div>
            <div className="contact-actions" data-contact-item>
              <a className="contact-email" href="mailto:3282049506@qq.com">
                <span>发送邮件</span>
                <strong>3282049506@qq.com</strong>
                <ArrowUpRight size={32} strokeWidth={1.4} />
              </a>
              <div className="contact-secondary">
                <a href="tel:13802331718"><Phone size={17} />138 0233 1718</a>
                <a href={assetUrl('resume-zheng-shihuai.pdf')} download>
                  <Download size={17} />下载个人简历
                </a>
              </div>
            </div>
          </div>
          <footer className="site-footer content-frame" data-contact-item>
            <span>© 2026 郑世怀</span>
            <span>MECHANICAL DESIGN / AUTOMATION</span>
            <a href="#top">回到顶部 <ChevronRight size={15} /></a>
          </footer>
        </section>
      </main>
    </div>
  )
}

export default App
