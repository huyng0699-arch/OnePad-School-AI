import AccountManagementPanel from "../../components/AccountManagementPanel";
import AdminLayout from "../../components/AdminLayout";
import { onepadApi } from "../../lib/api";

export default async function AccountsPage() {
  const data = await onepadApi.dataset();
  return (
    <AdminLayout active="accounts" title="Accounts & Passwords" subtitle="Create school accounts, reset real login passwords, lock users, and audit identity operations inside the closed school platform.">
      <AccountManagementPanel initialAccounts={data.accounts} />
    </AdminLayout>
  );
}
