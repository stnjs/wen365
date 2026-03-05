export const useDemoMode = () => {
  const isDemoMode = useState<boolean>("demoMode", () => false);

  const enableDemo = () => {
    isDemoMode.value = true;
  };

  const disableDemo = () => {
    isDemoMode.value = false;
  };

  return { isDemoMode, enableDemo, disableDemo };
};
