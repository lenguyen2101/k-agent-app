import { Redirect } from 'expo-router';

// Root → splash. Splash hydrate appStatus rồi route tới màn phù hợp
// (onboarding / force-update / maintenance / login / tabs).
export default function Index() {
  return <Redirect href="/splash" />;
}
