export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession();

  // Redirect to home if not authenticated
  if (!loggedIn.value) {
    return navigateTo("/");
  }
});
