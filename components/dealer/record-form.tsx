"use client";

import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { ZodError } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { appointmentSchema, carImages, leadSchema, localDate, saleSchema, updateDealerData, vehicleSchema, type Appointment, type DealerData, type Lead, type Vehicle } from "@/lib/dealer-store";

export type Editor = { kind: "vehicle"; record?: Vehicle } | { kind: "lead"; record?: Lead } | { kind: "appointment"; record?: Appointment } | { kind: "sale"; vehicleId?: string; customer?: string };
type FieldProps = { label: string; name: string; value?: string | number; type?: string; required?: boolean; min?: string | number; max?: string | number; step?: string | number; children?: React.ReactNode };

export function Field({ label, name, value, type = "text", required = true, min, max, step, children }: FieldProps) {
  return <label className="form-field"><span>{label}{required && <i> *</i>}</span>{children ? <select name={name} defaultValue={value} required={required}>{children}</select> : <input name={name} type={type} defaultValue={value} required={required} min={min} max={max} step={step} />}</label>;
}
const options = (values: string[]) => values.map((v) => <option key={v} value={v}>{v}</option>);

export function RecordForm({ editor, data, onClose, onSaved }: { editor: Editor; data: DealerData; onClose: () => void; onSaved: (message: string) => void }) {
  const [error, setError] = useState("");
  const record = "record" in editor ? editor.record : undefined;
  const title = `${record ? "Edit" : editor.kind === "sale" ? "Record" : "Add"} ${editor.kind === "lead" ? "lead" : editor.kind === "appointment" ? "appointment" : editor.kind === "sale" ? "a sale" : "vehicle"}`;
  const vehicle = editor.kind === "vehicle" ? editor.record : undefined;
  const lead = editor.kind === "lead" ? editor.record : undefined;
  const appointment = editor.kind === "appointment" ? editor.record : undefined;
  const available = data.vehicles.filter((v) => v.status !== "Sold" || v.id === lead?.vehicleId || v.id === appointment?.vehicleId);
  const [saleVehicleId, setSaleVehicleId] = useState(editor.kind === "sale" ? editor.vehicleId ?? available[0]?.id ?? "" : "");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    const number = (key: string) => Number(form.get(key));
    const id = record?.id ?? crypto.randomUUID();
    try {
      updateDealerData((current) => {
        if (editor.kind === "vehicle") {
          const latest = current.vehicles.find((v) => v.id === id);
          if (vehicle && !latest) throw new Error("This vehicle has been removed in another tab. Close this form and refresh your inventory.");
          if (current.vehicles.some((v) => v.stock.toLowerCase() === text("stock").toLowerCase() && v.id !== id)) throw new Error("A vehicle with this stock number already exists.");
          const parsed = vehicleSchema.parse({ id, name: text("name"), year: number("year"), price: number("price"), mileage: number("mileage"), fuel: text("fuel"), transmission: text("transmission"), body: text("body"), status: latest?.status === "Sold" ? "Sold" : text("status"), image: text("image"), stock: text("stock"), added: latest?.added ?? localDate(new Date()) });
          return { ...current, vehicles: vehicle ? current.vehicles.map((v) => v.id === id ? parsed : v) : [parsed, ...current.vehicles] };
        }
        if (editor.kind === "lead") {
          const latest = current.leads.find((l) => l.id === id);
          if (!current.vehicles.some((v) => v.id === text("vehicleId"))) throw new Error("Choose an existing vehicle.");
          if (current.vehicles.find((v) => v.id === text("vehicleId"))?.status === "Sold" && latest?.vehicleId !== text("vehicleId")) throw new Error("This vehicle has already been sold. Please choose an available vehicle.");
          const parsed = leadSchema.parse({ id, name: text("name"), email: text("email"), phone: text("phone"), vehicleId: latest?.stage === "Won" ? latest.vehicleId : text("vehicleId"), stage: latest?.stage ?? "New", source: text("source"), created: latest?.created ?? localDate(new Date()) });
          return { ...current, leads: lead ? current.leads.map((l) => l.id === id ? parsed : l) : [parsed, ...current.leads] };
        }
        if (editor.kind === "appointment") {
          const latest = current.appointments.find((a) => a.id === id);
          const date = text("date");
          const time = text("time");
          if (`${date}T${time}` < `${localDate(new Date())}T${new Date().toTimeString().slice(0, 5)}` && (!appointment || `${date}T${time}` !== `${appointment.date}T${appointment.time}`)) throw new Error("Please choose a future appointment time.");
          if (current.appointments.some((a) => a.id !== id && a.date === date && a.time === time && a.status === "Scheduled")) throw new Error("This time slot is already booked. Please choose another time.");
          const parsed = appointmentSchema.parse({ id, customer: text("customer"), vehicleId: text("vehicleId"), date, time, type: text("type"), status: latest?.status ?? "Scheduled" });
          if (!current.vehicles.some((v) => v.id === parsed.vehicleId)) throw new Error("Choose an existing vehicle.");
          return { ...current, appointments: appointment ? current.appointments.map((a) => a.id === id ? parsed : a) : [...current.appointments, parsed] };
        }
        const soldVehicle = current.vehicles.find((v) => v.id === saleVehicleId);
        const customer = current.leads.find((l) => l.id === text("customerId"));
        if (!soldVehicle || soldVehicle.status === "Sold") throw new Error("This vehicle is no longer available.");
        if (!customer) throw new Error("Choose a customer. Add them as a lead first if needed.");
        if (text("date") > localDate(new Date())) throw new Error("A completed sale cannot have a future date.");
        const sale = saleSchema.parse({ id, customer: customer.name, vehicleId: soldVehicle.id, amount: number("amount"), date: text("date"), payment: text("payment") });
        return {
          ...current,
          sales: [sale, ...current.sales],
          vehicles: current.vehicles.map((v) => v.id === soldVehicle.id ? { ...v, status: "Sold" } : v),
          leads: customer.vehicleId === soldVehicle.id
            ? current.leads.map((l) => l.id === customer.id ? { ...l, stage: "Won" } : l.vehicleId === soldVehicle.id && l.stage !== "Won" ? { ...l, stage: "Lost" } : l)
            : [...current.leads.map((l) => l.vehicleId === soldVehicle.id && l.stage !== "Won" ? { ...l, stage: "Lost" as const } : l), { ...customer, id: crypto.randomUUID(), stage: "Won", vehicleId: soldVehicle.id, created: localDate(new Date()) }],
        };
      });
      onSaved(`${editor.kind === "sale" ? "Sale recorded and inventory updated" : `${editor.kind[0].toUpperCase()}${editor.kind.slice(1)} ${record ? "updated" : "added"}`}.`);
      onClose();
    } catch (err) {
      setError(err instanceof ZodError ? `Check ${err.issues[0]?.path.join(".")}: ${err.issues[0]?.message}` : err instanceof Error ? err.message : "Unable to save this record.");
    }
  }

  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="dealer-dialog record-dialog"><DialogTitle className="capitalize">{title}</DialogTitle><DialogDescription>{editor.kind === "sale" ? "Record a completed transaction. The vehicle and customer pipeline will update together." : "Keep your workspace up to date. Changes are saved in this browser."}</DialogDescription><form onSubmit={submit}>
    <div className="record-fields">
      {editor.kind === "vehicle" && <>
        <Field label="Make & model" name="name" value={vehicle?.name} />
        <Field label="Stock number" name="stock" value={vehicle?.stock} />
        <Field label="Model year" name="year" type="number" min="1900" max={new Date().getFullYear() + 2} value={vehicle?.year ?? new Date().getFullYear()} />
        <Field label={`Asking price (${data.settings.currency})`} name="price" type="number" min="1" step="0.01" value={vehicle?.price} />
        <Field label="Mileage (km)" name="mileage" type="number" min="0" value={vehicle?.mileage ?? 0} />
        <Field label="Body type" name="body" value={vehicle?.body ?? "Sedan"}>{options(["SUV", "Sedan", "Coupe", "Truck", "Hatchback"])}</Field>
        <Field label="Fuel type" name="fuel" value={vehicle?.fuel ?? "Petrol"}>{options(["Petrol", "Diesel", "Electric", "Hybrid"])}</Field>
        <Field label="Transmission" name="transmission" value={vehicle?.transmission ?? "Automatic"}>{options(["Automatic", "Manual"])}</Field>
        {vehicle?.status !== "Sold" && <Field label="Availability" name="status" value={vehicle?.status ?? "Available"}>{options(["Available", "Reserved"])}</Field>}
        <Field label="Demo vehicle photo" name="image" value={vehicle?.image ?? carImages.bmw}>{Object.entries(carImages).map(([name, url]) => <option value={url} key={name}>{name.toUpperCase()} photo</option>)}</Field>
      </>}
      {editor.kind === "lead" && <>
        <Field label="Customer name" name="name" value={lead?.name} /><Field label="Email address" name="email" type="email" value={lead?.email} />
        <Field label="Phone number" name="phone" type="tel" value={lead?.phone} /><Field label="Lead source" name="source" value={lead?.source ?? "Website"}>{options(["Website", "Walk-in", "Referral", "Social media"])}</Field>
        <Field label="Vehicle of interest" name="vehicleId" value={lead?.vehicleId ?? available[0]?.id}><option value="">Select a vehicle</option>{available.map((v) => <option key={v.id} value={v.id}>{v.year} {v.name} ({v.stock})</option>)}</Field>
      </>}
      {editor.kind === "appointment" && <>
        <Field label="Customer name" name="customer" value={appointment?.customer} />
        <Field label="Appointment type" name="type" value={appointment?.type ?? "Test drive"}>{options(["Test drive", "Vehicle delivery", "Consultation"])}</Field>
        <Field label="Date" name="date" type="date" min={appointment?.date ?? localDate(new Date())} value={appointment?.date ?? localDate(new Date())} />
        <Field label="Time" name="time" type="time" value={appointment?.time ?? "10:00"} />
        <Field label="Vehicle" name="vehicleId" value={appointment?.vehicleId ?? available[0]?.id}><option value="">Select a vehicle</option>{data.vehicles.map((v) => <option key={v.id} value={v.id}>{v.year} {v.name}</option>)}</Field>
      </>}
      {editor.kind === "sale" && <>
        <label className="form-field"><span>Vehicle *</span><select name="vehicleId" required value={saleVehicleId} onChange={(e) => setSaleVehicleId(e.target.value)}><option value="">Select a vehicle</option>{available.map((v) => <option key={v.id} value={v.id}>{v.year} {v.name} ({v.stock})</option>)}</select></label>
        <Field label="Customer" name="customerId" value={data.leads.find((l) => editor.customer === l.name)?.id ?? ""}><option value="">Select a customer</option>{data.leads.map((l) => <option value={l.id} key={l.id}>{l.name} ({l.email})</option>)}</Field>
        <Field key={saleVehicleId} label={`Sale amount (${data.settings.currency})`} name="amount" type="number" min="1" step="0.01" value={data.vehicles.find((v) => v.id === saleVehicleId)?.price} />
        <Field label="Sale date" name="date" type="date" max={localDate(new Date())} value={localDate(new Date())} />
        <Field label="Payment method" name="payment" value="Bank transfer">{options(["Cash", "Finance", "Bank transfer"])}</Field>
      </>}
    </div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{record ? <Save size={16} /> : <Plus size={16} />}{record ? "Save changes" : editor.kind === "sale" ? "Record sale" : `Add ${editor.kind}`}</button></div>
  </form></DialogContent></Dialog>;
}
