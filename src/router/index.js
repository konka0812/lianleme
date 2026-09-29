import { createRouter, createWebHashHistory } from 'vue-router'
import { settings } from '../stores/settings'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('../views/HomeView.vue') },
    { path: '/onboarding', component: () => import('../views/OnboardingView.vue') },
    { path: '/m/:id', component: () => import('../views/MuscleView.vue') },
    { path: '/e/:slug', component: () => import('../views/ExerciseDetailView.vue') },
    { path: '/search', component: () => import('../views/SearchView.vue') },
    { path: '/generator', component: () => import('../views/GeneratorView.vue') },
    { path: '/workout', component: () => import('../views/WorkoutView.vue') },
    { path: '/me', component: () => import('../views/ProfileView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  if (!settings.onboarded && to.path !== '/onboarding') return '/onboarding'
  if (settings.onboarded && to.path === '/onboarding') return '/'
})

export default router
