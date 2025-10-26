import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Code, Mail, Sparkles, LayoutGrid } from 'lucide-react';

import { LanguageContext } from '../contexts/AppContexts';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../lib/i18n';
import useWindowStore from '../stores/windowStore';

import ContentCreatorApp from './ContentCreatorApp';
import CodingAgentUI from './agents/CodingAgentUI';
import CommunicatorAgentUI from './agents/CommunicatorAgentUI';
import { MegaphoneIcon, CodeIcon, MailIcon, UsersIcon } from './IconComponents';

import type { AppDefinition } from '../types';

type MiniAgentsHubProps = {
  onTaskComplete: (entry: any) => void;
  appId: string;
};

type MiniAppConfig = {
  id: string;
  gradient: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  appIcon: React.ComponentType<{ className?: string; color?: string }>;
  component: React.ComponentType<any>;
};

const miniApps: MiniAppConfig[] = [
  {
    id: 'contentCreator',
    gradient: 'from-sky-500 via-cyan-400 to-sky-500',
    color: 'cyan',
    icon: Megaphone,
    appIcon: MegaphoneIcon,
    component: ContentCreatorApp,
  },
  {
    id: 'coding',
    gradient: 'from-purple-500 via-violet-500 to-blue-500',
    color: 'purple',
    icon: Code,
    appIcon: CodeIcon,
    component: CodingAgentUI,
  },
  {
    id: 'communicator',
    gradient: 'from-rose-500 via-pink-500 to-amber-400',
    color: 'pink',
    icon: Mail,
    appIcon: MailIcon,
    component: CommunicatorAgentUI,
  },
];

const MiniAgentsHub: React.FC<MiniAgentsHubProps> = (_props) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const { openWindow } = useWindowStore();
  const margeText = translations.agents.marge?.[lang];
  const globalText = translations.global[lang];

  const handleLaunch = (miniApp: MiniAppConfig) => {
    const agentTranslation = translations.agents[miniApp.id];
    if (!agentTranslation) return;

    const definition: AppDefinition = {
      id: miniApp.id,
      name: {
        en: agentTranslation.en.name,
        ar: agentTranslation.ar.name,
      },
      description: {
        en: agentTranslation.en.description,
        ar: agentTranslation.ar.description,
      },
      icon: miniApp.appIcon as React.FC<{ className?: string; color?: string }>,
      color: miniApp.color,
      component: miniApp.component,
    };

    openWindow(definition);
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: theme.colors.background }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 opacity-95" />
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-[-20%] left-[-10%] h-72 w-72 rounded-full bg-purple-500/30 blur-3xl"
          animate={{ scale: [0.9, 1.1, 0.95], opacity: [0.2, 0.4, 0.25] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[-10%] h-80 w-80 rounded-full bg-rose-500/30 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.3] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col gap-10 p-8">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl text-white shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 via-pink-400 to-cyan-400 shadow-lg">
                <UsersIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-purple-200">
                  {globalText.miniAgentsHub}
                </p>
                <h1 className="text-3xl font-black sm:text-4xl">{margeText?.name ?? 'Marge'}</h1>
              </div>
            </div>
            <motion.span
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-purple-100"
              animate={{ opacity: [0.6, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="h-4 w-4" />
              {margeText?.description ?? 'Launch specialized mini agents instantly.'}
            </motion.span>
          </div>

          <div className="grid gap-3 text-sm text-white/70 md:grid-cols-3">
            {miniApps.map((miniApp) => {
              const taskLabel = margeText?.tasks?.[miniApp.id] ?? '';
              return (
                <div
                  key={miniApp.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <miniApp.icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-white/60">
                      {taskLabel}
                    </span>
                    <span className="font-semibold text-white">
                      {translations.agents[miniApp.id]?.[lang]?.name ?? miniApp.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </header>

        <section className="grid flex-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {miniApps.map((miniApp, index) => {
            const agentTranslation = translations.agents[miniApp.id]?.[lang];
            const subAppText = translations.agents.marge?.[lang]?.subApps?.[miniApp.id];
            const title = subAppText?.title ?? agentTranslation?.name ?? miniApp.id;
            const description = subAppText?.description ?? agentTranslation?.description ?? '';

            return (
              <motion.button
                key={miniApp.id}
                onClick={() => handleLaunch(miniApp)}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-left text-white shadow-xl"
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 260, damping: 25, delay: index * 0.05 }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${miniApp.gradient} opacity-10 transition-opacity duration-500 group-hover:opacity-20`}
                />
                <div className="relative flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-lg">
                    <miniApp.icon className="h-7 w-7" />
                  </div>
                  <motion.span
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/80"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {globalText.start}
                  </motion.span>
                </div>

                <div className="relative mt-6 space-y-3">
                  <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                  <p className="text-sm leading-relaxed text-white/80">{description}</p>
                </div>

                <div className="relative mt-6 flex items-center gap-2 text-sm font-semibold text-white/90 transition-transform duration-300 group-hover:translate-x-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span>{margeText?.tasks?.[miniApp.id] ?? globalText.appLauncher}</span>
                </div>
              </motion.button>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default MiniAgentsHub;
