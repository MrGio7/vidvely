import React from "react";
import { ErrorSVG, LoaderSpinner, SuccessSVG, UserSVG } from "~/assets/SVG";
import { useAppContext } from "~/context/app.context";
import { trpc } from "~/utils/trpc";

interface UserMenuProps {}

const UserMenu: React.FC<UserMenuProps> = () => {
  const { user, setUser } = useAppContext();
  const { isLoading: userUpdateIsLoading, isError: userUpdateIsError, isSuccess: userUpdateIsSuccess, mutate: userUpdateMutate } = trpc.user.updateUser.useMutation();

  const userUpdateSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const firstName = event.currentTarget.firstName.value;
    const lastName = event.currentTarget.lastName.value;

    userUpdateMutate({ firstName, lastName });
    setUser((prevState) => (!!prevState ? { ...prevState, firstName, lastName } : null));
  };

  const logoutHandler = async () => {
    setUser(null);
    await fetch("api/auth/signout")
      .then((res) => res.json())
      .then((redirectUrl) => window.location.replace(redirectUrl));
  };

  const updateUserButtonContent = (() => {
    if (userUpdateIsLoading)
      return (
        <>
          <LoaderSpinner />
          Updating...
        </>
      );
    if (userUpdateIsError)
      return (
        <>
          <ErrorSVG className="mr-1 text-red-700" />
          Error
        </>
      );
    if (userUpdateIsSuccess)
      return (
        <>
          <SuccessSVG className="mr-1 text-green-700" />
          Updated
        </>
      );

    return "Update";
  })();

  return (
    <section className="group absolute top-5 left-5">
      <UserSVG className="h-12 w-12 text-slate-300" />
      <ul className="mt-2 hidden flex-col gap-y-2 rounded-md bg-slate-300 p-5 group-hover:flex">
        <li className="text-xl">
          <form className="flex flex-col" onSubmit={userUpdateSubmitHandler}>
            <label className="text-sm" htmlFor="firstName">
              First Name
            </label>
            <input type="text" name="firstName" id="firstName" defaultValue={user?.firstName || ""} />
            <label className="mt-2 text-sm" htmlFor="lastName">
              Last Name
            </label>
            <input type="text" name="lastName" id="lastName" defaultValue={user?.lastName || ""} />
            <button className="mx-auto my-2 inline-flex w-3/5 items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold leading-6 text-white shadow" disabled={userUpdateIsLoading}>
              {updateUserButtonContent}
            </button>
          </form>
        </li>
        <hr className="border-1 border-slate-900" />
        <li className="flex w-full justify-center text-xl">
          <button className="mx-auto mt-2 inline-flex w-3/5 items-center justify-center rounded-md bg-red-700 px-4 py-2 text-sm font-semibold leading-6 text-white shadow" onClick={logoutHandler}>
            Logout
          </button>
        </li>
      </ul>
    </section>
  );
};

export default UserMenu;
