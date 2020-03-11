export default function isLoggedIn({ next, router }) {
  return axios({ method: "POST", "url": window.apiURI+"/session"}).then(response => {
    window.user = response.data.user;
    return next();
  }).catch(error => {
    window.user = false;
    return router.push({ name: 'Login' });
  });
}