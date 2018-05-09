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
  delay: routeLoadingDelay
})

// const join = process.env.SERVER ? require('path').join : () => {}
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
  delay: routeLoadingDelay
})

export const FAQView = Loadable<any, any>({
  loader: () => import('./FAQView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay
})

export const LegalNoticeView = Loadable<any, any>({
  loader: () => import('./LegalNoticeView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay
})

export const MainView = Loadable<any, any>({
  loader: () => import('./MainView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay
})

export const PrivacyPolicyView = Loadable<any, any>({
  loader: () => import('./PrivacyPolicyView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay
})

export const ProfileView = Loadable<any, any>({
  loader: () => import('./ProfileView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay
})

export const SocialView = Loadable<any, any>({
  loader: () => import('./SocialView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay
})

export const UploadView = Loadable<any, any>({
  loader: () => import('./UploadView'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay
})

export const Upload64View = Loadable<any, any>({
  loader: () => import('./Upload64View'),
  loading: () => RouteLoading(),
  delay: routeLoadingDelay
})
