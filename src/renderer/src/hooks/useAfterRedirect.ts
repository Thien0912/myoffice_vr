// Xử lý redirect về lại url được quy định sau khi đăng nhập

export const useAfterRedirect = {
  set: (url?: string) => {
    sessionStorage.setItem(
      'redirectAfterLogin',
      url ?? window.location.pathname + window.location.search
    )
  },
  get: (): string | null => {
    const url = sessionStorage.getItem('redirectAfterLogin')
    sessionStorage.removeItem('redirectAfterLogin')
    return url
  },
  execute: () => {
    const url = useAfterRedirect.get()
    if (url) {
      window.location.href = url
    }
  }
}
