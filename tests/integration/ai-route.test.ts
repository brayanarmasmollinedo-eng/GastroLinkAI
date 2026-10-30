import { afterEach,describe,it,expect,vi } from "vitest";
import { GET,POST } from "@/app/api/ai/intent/route";
afterEach(()=>vi.unstubAllEnvs());
describe("endpoint local de IA",()=>{
 it("no expone credenciales en el estado",async()=>{vi.stubEnv("AI_ENABLED","true");vi.stubEnv("AI_PROVIDER","");vi.stubEnv("GEMINI_API_KEY","private-test");expect(await (await GET(new Request("http://127.0.0.1:3100/api/ai/intent"))).json()).toEqual({configured:true,missing:[],publicBlocked:false});});
 it("indica qué falta sin exponer valores",async()=>{vi.stubEnv("AI_ENABLED","true");vi.stubEnv("AI_PROVIDER","");vi.stubEnv("GEMINI_API_KEY","");expect((await (await GET(new Request("http://127.0.0.1:3100/api/ai/intent"))).json()).missing).toEqual(["GEMINI_API_KEY"]);});
 it("acepta localhost en el mismo puerto",async()=>{vi.stubEnv("AI_ENABLED","false");const r=await POST(new Request("http://localhost:3100/api/ai/intent",{method:"POST",headers:{origin:"http://localhost:3100","content-type":"application/json"},body:"{}"}));expect(r.status).toBe(503);});
 it("rechaza localhost en otro puerto",async()=>{const r=await POST(new Request("http://localhost:9999/api/ai/intent",{method:"POST",headers:{origin:"http://localhost:9999"},body:"{}"}));expect(r.status).toBe(403);});
 it("rechaza orígenes externos",async()=>{const r=await POST(new Request("http://127.0.0.1:3100/api/ai/intent",{method:"POST",headers:{origin:"https://untrusted.example"},body:"{}"}));expect(r.status).toBe(403);});
 it("sin clave no finge que ha usado IA",async()=>{vi.stubEnv("AI_ENABLED","false");const r=await POST(new Request("http://127.0.0.1:3100/api/ai/intent",{method:"POST",headers:{origin:"http://127.0.0.1:3100","content-type":"application/json"},body:JSON.stringify({text:"Necesito ají"})}));expect(r.status).toBe(503);});
 it("rechaza consultas fuera del contrato antes de llamar al proveedor",async()=>{vi.stubEnv("AI_ENABLED","true");vi.stubEnv("AI_PROVIDER","");vi.stubEnv("GEMINI_API_KEY","test");const r=await POST(new Request("http://127.0.0.1:3100/api/ai/intent",{method:"POST",headers:{origin:"http://127.0.0.1:3100","content-type":"application/json"},body:JSON.stringify({text:"hola",extra:true})}));expect(r.status).toBe(400);});
});

describe("enlace público (Dev Tunnel)",()=>{
 const viaTunnel=(url:string)=>new Request(url,{method:"POST",headers:{origin:"http://localhost:3100","content-type":"application/json","x-forwarded-host":"abc-3100.brs.devtunnels.ms","x-forwarded-proto":"https"},body:"{}"});
 it("bloquea la IA cuando entra por un enlace público no autorizado",async()=>{vi.stubEnv("AI_ENABLED","true");vi.stubEnv("GEMINI_API_KEY","k");vi.stubEnv("AI_ALLOWED_ORIGINS","");const r=await POST(viaTunnel("http://localhost:3100/api/ai/intent"));expect(r.status).toBe(403);expect((await r.json()).error).toMatch(/enlace público/);});
 it("el estado informa publicBlocked sin exponer valores",async()=>{vi.stubEnv("AI_ENABLED","true");vi.stubEnv("GEMINI_API_KEY","k");vi.stubEnv("AI_ALLOWED_ORIGINS","");const body=await (await GET(new Request("http://localhost:3100/api/ai/intent",{headers:{"x-forwarded-host":"abc-3100.brs.devtunnels.ms"}}))).json();expect(body).toEqual({configured:false,missing:[],publicBlocked:true});});
 it("lo permite solo si el enlace figura en AI_ALLOWED_ORIGINS",async()=>{vi.stubEnv("AI_ENABLED","true");vi.stubEnv("GEMINI_API_KEY","k");vi.stubEnv("AI_ALLOWED_ORIGINS","https://abc-3100.brs.devtunnels.ms");const r=await POST(viaTunnel("http://localhost:3100/api/ai/intent"));expect(r.status).toBe(400);});
});
describe("Next.js rellena x-forwarded-host con el host local",()=>{
 it("no lo trata como enlace público",async()=>{vi.stubEnv("AI_ENABLED","true");vi.stubEnv("GEMINI_API_KEY","k");const body=await (await GET(new Request("http://127.0.0.1:3100/api/ai/intent",{headers:{"x-forwarded-host":"127.0.0.1:3100"}}))).json();expect(body.publicBlocked).toBe(false);});
});
