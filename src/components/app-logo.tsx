import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-md">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="grid flex-1 text-left text-md">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Beitrag
                </span>
            </div>
        </>
    );
}