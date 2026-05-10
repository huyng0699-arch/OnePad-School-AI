import { onepadApi } from "../../lib/api";

export default async function MyTeachingScopePage(){
  const { teacher } = await onepadApi.dataset();
  return <div className="shell"><main className="main"><section className="hero"><div className="hero-top"><div><div className="kicker">My Teaching Scope</div><h2>{teacher.name} scope overview</h2><p>Subject Teaching + Homeroom + Education Guardian are access scopes, not fixed roles.</p></div></div></section></main></div>;
}
