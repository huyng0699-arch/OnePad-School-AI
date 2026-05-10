import AdminLayout from "../../components/AdminLayout";
import ParentsTable from "../../components/tables/ParentsTable";
import { onepadApi } from "../../lib/api";

export default async function ParentsPage() {
  const data = await onepadApi.dataset();
  return <AdminLayout active="parents" title="Parents Management" subtitle="One parent account is linked to exactly one student in this admin dataset.">
    <section className="section card"><p>Parent account policy: one account per student link. Multi-child UI is intentionally disabled.</p></section>
    <section className="section card solid"><ParentsTable rows={data.parents} /></section>
  </AdminLayout>;
}
