import * as React from 'react'
import * as Loadable from 'react-loadable'

const routeLoadingDelay = 300

function RouteLoading (): JSX.Element {
  return (
    <div>
      Loading...
    </div>
  )
}

export const BlogView = Loadable<any, any>({
  loader: () => import('./BlogView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./BlogView'],
  // @ts-ignore
  webpack: () => [require.resolveWeak('./BlogView')]
})

export const CoursesView = Loadable<any, any>({
  loader: () => import('./CoursesView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./CoursesView'],
  // @ts-ignore
  webpack: () => [require.resolveWeak('./CoursesView')]
})

export const Courses64View = Loadable<any, any>({
  loader: () => import('./Courses64View'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./Courses64View'],
  // @ts-ignore
  webpack: () => [require.resolveWeak('./Courses64View')]
})

export const FAQView = Loadable<any, any>({
  loader: () => import('./FAQView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./FAQView'],
  // @ts-ignore
  webpack: () => [require.resolveWeak('./FAQView')]
})

export const LegalNoticeView = Loadable<any, any>({
  loader: () => import('./LegalNoticeView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./LegalNoticeView'],
  // @ts-ignore
  webpack: () => [require.resolveWeak('./LegalNoticeView')]
})

export const MainView = Loadable<any, any>({
  loader: () => import('./MainView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./MainView'],
  // @ts-ignore
  webpack: () => [require.resolveWeak('./MainView')]
})

export const PrivacyPolicyView = Loadable<any, any>({
  loader: () => import('./PrivacyPolicyView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./PrivacyPolicyView'],
  // @ts-ignore
  webpack: () => [require.resolveWeak('./PrivacyPolicyView')]
})

export const ProfileView = Loadable<any, any>({
  loader: () => import('./ProfileView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./ProfileView'],
  // @ts-ignore
  webpack: () => [require.resolveWeak('./ProfileView')]
})

export const SocialView = Loadable<any, any>({
  loader: () => import('./SocialView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./SocialView'],
  // @ts-ignore
  webpack: () => [require.resolveWeak('./SocialView')]
})

export const UploadView = Loadable<any, any>({
  loader: () => import('./UploadView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./UploadView'],
  // @ts-ignore
  webpack: () => [require.resolveWeak('./UploadView')]
})

export const Upload64View = Loadable<any, any>({
  loader: () => import('./Upload64View'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./Upload64View'],
  // @ts-ignore
  webpack: () => [require.resolveWeak('./Upload64View')]
})
