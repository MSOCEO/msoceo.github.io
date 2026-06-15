import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://xwvkdluvixurvgvkhkfe.supabase.co',
  'sb_publishable_NOdEPhf8yD4dMRJIH1JqqA_z5By3p0H'
)

// 检查登录状态
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// 获取当前用户
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// 注册
export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  })
  return { data, error }
}

// 登录
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

// GitHub OAuth 登录
export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin + '/yunjian' }
  })
  return { data, error }
}

// 登出
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}
