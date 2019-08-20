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
  loader: (): any => import('./BlogView'),
  loading: (): JSX.Element => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./BlogView'],
  // @ts-ignore
  webpack: (): any => [require.resolveWeak('./BlogView')]
})

export const CoursesView = Loadable<any, any>({
  loader: (): any => import('./CoursesView'),
  loading: (): JSX.Element => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./CoursesView'],
  // @ts-ignore
  webpack: (): any => [require.resolveWeak('./CoursesView')]
})

export const Courses64View = Loadable<any, any>({
  loader: (): any => import('./Courses64View'),
  loading: (): JSX.Element => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./Courses64View'],
  // @ts-ignore
  webpack: (): any => [require.resolveWeak('./Courses64View')]
})

export const FAQView = Loadable<any, any>({
  loader: (): any => import('./FAQView'),
  loading: (): JSX.Element => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./FAQView'],
  // @ts-ignore
  webpack: (): any => [require.resolveWeak('./FAQView')]
})

export const LegalNoticeView = Loadable<any, any>({
  loader: (): any => import('./LegalNoticeView'),
  loading: (): JSX.Element => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./LegalNoticeView'],
  // @ts-ignore
  webpack: (): any => [require.resolveWeak('./LegalNoticeView')]
})

export const MainView = Loadable<any, any>({
  loader: (): any => import('./MainView'),
  loading: (): JSX.Element => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./MainView'],
  // @ts-ignore
  webpack: (): any => [require.resolveWeak('./MainView')]
})

export const PrivacyPolicyView = Loadable<any, any>({
  loader: (): any => import('./PrivacyPolicyView'),
  loading: (): JSX.Element => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./PrivacyPolicyView'],
  // @ts-ignore
  webpack: (): any => [require.resolveWeak('./PrivacyPolicyView')]
})

export const ProfileView = Loadable<any, any>({
  loader: (): any => import('./ProfileView'),
  loading: (): JSX.Element => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./ProfileView'],
  // @ts-ignore
  webpack: (): any => [require.resolveWeak('./ProfileView')]
})

export const SocialView = Loadable<any, any>({
  loader: (): any => import('./SocialView'),
  loading: (): JSX.Element => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./SocialView'],
  // @ts-ignore
  webpack: (): any => [require.resolveWeak('./SocialView')]
})

export const UploadView = Loadable<any, any>({
  loader: (): any => import('./UploadView'),
  loading: (): JSX.Element => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./UploadView'],
  // @ts-ignore
  webpack: (): any => [require.resolveWeak('./UploadView')]
})

export const Upload64View = Loadable<any, any>({
  loader: (): any => import('./Upload64View'),
  loading: (): JSX.Element => RouteLoading(),
  delay: routeLoadingDelay,
  modules: ['./Upload64View'],
  // @ts-ignore
  webpack: (): any => [require.resolveWeak('./Upload64View')]
})
