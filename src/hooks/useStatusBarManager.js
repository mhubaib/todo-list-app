export function useStatusBarManager({ setIsStatusBarHidden, isStatusBarHidden }) {
    const changeStatusBarVisibility = () => setIsStatusBarHidden(!isStatusBarHidden);

    return { changeStatusBarVisibility };
}