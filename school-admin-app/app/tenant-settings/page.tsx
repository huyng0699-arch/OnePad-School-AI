import AdminLayout from "../../components/AdminLayout";
import { ActionGroup } from "../../components/PageBits";

export default function TenantSettingsPage() {
  return <AdminLayout active="tenant-settings" title="School Settings" subtitle="Configure official school profile, academic year, platform modules, and closed-ecosystem policies.">
    <section className="section grid cols-2">
      <div className="card solid"><h3>School profile</h3><div className="form-grid"><label>School name<input defaultValue="Truong THCS Nguyen Trai" /></label><label>Managed domain<input defaultValue="nguyentrai.onepad.school" /></label><label>Academic year<input defaultValue="2026" /></label><label>Timezone<input defaultValue="Asia/Saigon" /></label><label>Default language<input defaultValue="Vietnamese / English" /></label></div></div>
      <div className="card solid"><h3>Closed ecosystem policy</h3><div className="form-grid"><label><input type="checkbox" defaultChecked /> Accounts created only by school admin</label><label><input type="checkbox" defaultChecked /> Force password change after reset</label><label><input type="checkbox" defaultChecked /> Parent sees only verified linked student</label><label><input type="checkbox" defaultChecked /> Teacher access scoped by class and subject</label><label><input type="checkbox" defaultChecked /> Local AI first, cloud fallback audited</label><label><input type="checkbox" defaultChecked /> Export aggregate reports only</label></div></div>
    </section>
    <section className="section card"><ActionGroup items={[
      {label:"Save settings",title:"Save Tenant Settings",description:"Persist school profile and feature flag settings.",variant:"modal",confirmLabel:"Save settings"},
      {label:"Preview branding",title:"Preview Branding",description:"Preview tenant branding on web shell.",variant:"drawer"},
      {label:"Reset changes",title:"Reset Changes",description:"Reset unsaved settings to last saved state.",variant:"modal",confirmLabel:"Reset"}
    ]}/></section>
  </AdminLayout>;
}
