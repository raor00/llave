/**
 * Conocimiento legal venezolano sobre arrendamiento de vivienda y uso comercial
 * regulado, encapsulado en cláusulas reusables. Cubre las protecciones clave
 * de la **Ley para la Regularización y Control de los Arrendamientos de
 * Vivienda (LRCAV, 2011)** y referencias complementarias de la Ley de
 * Arrendamientos Urbanos (LRAU). Estas cláusulas son la base con la que
 * `Llavero` ensambla contratos firmables — no son improvisadas.
 *
 * Resumen de las protecciones que aplica este módulo:
 * - Duración mínima 12 meses vivienda / 5 años uso comercial regulado.
 * - Prórroga automática si no se denuncia 60 días antes (Art. 22 LRCAV).
 * - Reajustes vía SUNAVI; no exceden inflación oficial BCV o lo pactado.
 * - Depósito máximo 4 meses (Art. 19 LRCAV) en cuenta separada. Llave lo
 *   absorbe en su Fondo Garantía 360° y NO se cobra al inquilino.
 * - Desalojo solo por causales del Art. 91 (insolvencia ≥2 meses, daño grave,
 *   uso indebido). Vía judicial obligatoria.
 * - Notificación previa 90 días para no prórroga.
 * - Prohibida cláusula que renuncie a derechos del inquilino.
 * - Indexación opcional BCV cada 12 meses.
 * - Mantenimiento mayor: propietario. Ordinario: inquilino.
 * - Servicios públicos: inquilino salvo pacto.
 *
 * El export `LRCAV_CLAUSES` provee párrafos legales ya redactados; el helper
 * `buildContractDraft` los personaliza con datos reales (partes, monto,
 * fechas) y devuelve un draft listo para revisión y firma.
 */

import { formatUSD } from "@/lib/format";
import type { Property } from "@/lib/types";

export type LrcavClause = {
  id: string;
  title: string;
  body: string;
  statute: string;
};

/**
 * Banco base de cláusulas LRCAV. Cada `body` es un párrafo formal listo para
 * insertar en un contrato. Mantener el lenguaje severo y firmable.
 */
export const LRCAV_CLAUSES: LrcavClause[] = [
  {
    id: "objeto",
    title: "Objeto del contrato",
    body:
      "EL ARRENDADOR cede en arrendamiento a EL ARRENDATARIO, quien acepta, el inmueble identificado en el presente contrato para su uso exclusivo como vivienda principal, comprometiéndose a destinarlo únicamente al fin pactado y a no subarrendarlo total ni parcialmente sin autorización escrita previa.",
    statute: "LRCAV Art. 7",
  },
  {
    id: "duracion",
    title: "Duración mínima",
    body:
      "La duración del presente contrato será como mínimo de doce (12) meses contados a partir de la fecha de entrega de las llaves, conforme a lo establecido en la legislación venezolana sobre arrendamiento de vivienda. Cualquier estipulación que reduzca este término se tendrá por no escrita.",
    statute: "LRCAV Art. 12",
  },
  {
    id: "prorroga",
    title: "Prórroga automática",
    body:
      "Vencido el término pactado, el contrato se entenderá prorrogado automáticamente por períodos iguales y sucesivos en las mismas condiciones, salvo que alguna de las partes notifique por escrito su voluntad de no prorrogarlo con al menos sesenta (60) días de anticipación al vencimiento.",
    statute: "LRCAV Art. 22",
  },
  {
    id: "canon",
    title: "Canon de arrendamiento",
    body:
      "EL ARRENDATARIO se obliga a pagar puntualmente el canon mensual acordado dentro de los primeros cinco (5) días de cada mes calendario, mediante los métodos electrónicos habilitados por la plataforma Llave (transferencia bancaria, Pago Móvil, Zelle u otro medio idóneo). Cada pago a tiempo construye el Trust Score del arrendatario conforme al modelo Llave.",
    statute: "LRCAV Art. 32",
  },
  {
    id: "reajuste",
    title: "Reajuste y SUNAVI",
    body:
      "Cualquier reajuste del canon se ajustará a los topes y procedimientos fijados por el Servicio Nacional de Vivienda y Hábitat (SUNAVI), no pudiendo exceder la variación oficial publicada por el Banco Central de Venezuela ni los términos pactados en este contrato. Las partes podrán acordar indexación anual conforme al índice oficial publicado por el BCV.",
    statute: "LRCAV Arts. 71-76",
  },
  {
    id: "deposito-llave",
    title: "Depósito y Garantía 360° Llave",
    body:
      "Las partes reconocen que, conforme al Art. 19 de la LRCAV, el depósito en garantía no podrá exceder de cuatro (4) mensualidades. En el modelo Llave, el depósito es asumido íntegramente por el Fondo de Garantía 360° de Llave, por lo que NO se cobra depósito al arrendatario. Llave responde ante daños cubiertos y mora menor conforme a su protocolo publicado. Esta cláusula no menoscaba los derechos del arrendatario sino que los amplía.",
    statute: "LRCAV Art. 19",
  },
  {
    id: "mantenimiento",
    title: "Mantenimiento",
    body:
      "EL ARRENDADOR estará obligado a sufragar las reparaciones mayores y los desperfectos estructurales del inmueble. EL ARRENDATARIO estará obligado a realizar las reparaciones menores y a conservar el inmueble en el mismo estado en que lo recibió, salvo el desgaste natural por el uso ordinario.",
    statute: "LRCAV Art. 49",
  },
  {
    id: "servicios",
    title: "Servicios públicos",
    body:
      "EL ARRENDATARIO se obliga a pagar puntualmente los servicios públicos consumidos durante la vigencia del contrato (electricidad, agua, gas, internet, aseo, condominio variable) salvo que las partes hayan pactado expresamente lo contrario en la cláusula de servicios incluidos.",
    statute: "LRCAV Art. 51",
  },
  {
    id: "uso-indebido",
    title: "Uso indebido y prohibiciones",
    body:
      "Queda prohibido a EL ARRENDATARIO usar el inmueble para fines distintos al pactado, realizar modificaciones estructurales sin autorización escrita, almacenar materiales peligrosos o ilícitos, ni perturbar la tranquilidad de los vecinos. El incumplimiento sostenido de estas obligaciones constituirá causal de desalojo conforme al Art. 91 de la LRCAV.",
    statute: "LRCAV Art. 91 lit. d",
  },
  {
    id: "desalojo",
    title: "Causales de desalojo",
    body:
      "EL ARRENDADOR sólo podrá solicitar el desalojo del inmueble por vía judicial y conforme a las causales taxativas del artículo 91 de la LRCAV, a saber: (i) falta de pago de dos (2) cánones consecutivos; (ii) daño grave al inmueble; (iii) uso indebido contrario a lo pactado; (iv) necesidad justificada del propietario o de un familiar dentro del segundo grado de consanguinidad. Queda prohibido el desalojo extrajudicial.",
    statute: "LRCAV Art. 91",
  },
  {
    id: "notificacion-no-prorroga",
    title: "Notificación previa para no prórroga",
    body:
      "En caso de que alguna de las partes decida no prorrogar el contrato al término pactado, deberá notificarlo por escrito a la otra parte con una antelación mínima de noventa (90) días continuos al vencimiento. La omisión de esta notificación generará automáticamente la prórroga del contrato.",
    statute: "LRCAV Art. 22",
  },
  {
    id: "irrenunciabilidad",
    title: "Irrenunciabilidad de derechos",
    body:
      "Las partes reconocen el carácter de orden público de la legislación venezolana en materia de arrendamiento de vivienda. En consecuencia, se tendrán por no escritas y nulas de pleno derecho las cláusulas que pretendan renunciar, limitar o disminuir los derechos del arrendatario reconocidos por la LRCAV.",
    statute: "LRCAV Art. 8",
  },
  {
    id: "garantia-llave",
    title: "Cobertura Garantía 360° Llave",
    body:
      "La plataforma Llave provee una Garantía 360° que cubre, conforme a su protocolo vigente: (i) reposición de mora hasta por un (1) mes; (ii) reparación de daños no estructurales reportados oportunamente; (iii) acompañamiento ante SUNAVI; y (iv) verificación periódica del inmueble. Esta garantía no sustituye las obligaciones legales de las partes pero reduce el riesgo operativo del arrendamiento.",
    statute: "Modelo Llave — supletorio LRCAV Art. 19",
  },
  {
    id: "jurisdiccion",
    title: "Jurisdicción y resolución de conflictos",
    body:
      "Para todo lo no previsto en el presente contrato, las partes se remiten a la Ley para la Regularización y Control de los Arrendamientos de Vivienda y demás normativa venezolana aplicable. Las controversias se ventilarán por ante los Tribunales competentes en materia inquilinaria de la jurisdicción donde se encuentre ubicado el inmueble, previa gestión conciliatoria ante SUNAVI cuando corresponda.",
    statute: "LRCAV Art. 100",
  },
];

// ---------------------------------------------------------------------------
// buildContractDraft — ensambla un draft de contrato real con datos del caso
// ---------------------------------------------------------------------------

export type ContractParty = {
  full_name: string;
  cedula: string;
  phone?: string;
  email?: string;
};

export type ContractPropertyRef = {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  rooms: number;
  bathrooms: number;
  area_m2: number | null;
};

export type ContractDraftInput = {
  owner: ContractParty;
  tenant: ContractParty;
  asesor?: ContractParty | null;
  property: ContractPropertyRef | Property;
  monthlyAmount: number;
  monthsTotal: number;
  startDate: string; // ISO date
  depositMonths: number; // valor LRCAV; Llave lo absorbe → 0 al inquilino
  currency: "USD" | "VES";
};

export type ContractSignature = {
  role: "propietario" | "inquilino" | "asesor";
  name: string;
  cedula: string;
  signed_at: string | null;
};

export type ContractDraft = {
  id: string;
  parties: {
    owner: ContractParty;
    tenant: ContractParty;
    asesor: ContractParty | null;
  };
  property: ContractPropertyRef;
  terms: {
    monthly_amount: number;
    currency: "USD" | "VES";
    months_total: number;
    start_date: string;
    end_date: string;
    deposit_months_lrcav: number;
    deposit_charged_to_tenant: 0;
    payment_due_day: number;
  };
  clauses: LrcavClause[];
  signatures: ContractSignature[];
  generated_at: string;
};

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

function toPropertyRef(p: ContractPropertyRef | Property): ContractPropertyRef {
  return {
    id: p.id,
    title: p.title,
    address: p.address,
    city: p.city,
    state: p.state,
    rooms: p.rooms,
    bathrooms: p.bathrooms,
    area_m2: p.area_m2 ?? null,
  };
}

/**
 * Personaliza el banco de cláusulas con los datos del contrato concreto. La
 * cláusula `objeto` queda parametrizada con la dirección, la `canon` con el
 * monto. El resto se devuelve tal cual ya que su redacción es independiente
 * de los datos.
 */
function personalizeClauses(input: ContractDraftInput): LrcavClause[] {
  const monthly = formatUSD(input.monthlyAmount);
  return LRCAV_CLAUSES.map((c) => {
    if (c.id === "objeto") {
      return {
        ...c,
        body:
          `EL ARRENDADOR ${input.owner.full_name}, titular de la cédula de identidad N° ${input.owner.cedula}, ` +
          `cede en arrendamiento a EL ARRENDATARIO ${input.tenant.full_name}, titular de la cédula N° ${input.tenant.cedula}, ` +
          `el inmueble ubicado en ${input.property.address}, ${input.property.city}, ${input.property.state}, ` +
          `Venezuela, para su uso exclusivo como vivienda principal del arrendatario y su grupo familiar. ` +
          `EL ARRENDATARIO se obliga a destinarlo únicamente al fin pactado y a no subarrendarlo total ni parcialmente sin autorización escrita previa.`,
      };
    }
    if (c.id === "canon") {
      return {
        ...c,
        body:
          `EL ARRENDATARIO se obliga a pagar un canon mensual de ${monthly} (${input.currency}) ` +
          `dentro de los primeros cinco (5) días de cada mes calendario, mediante los métodos electrónicos habilitados ` +
          `por la plataforma Llave (transferencia bancaria, Pago Móvil, Zelle, Binance Pay u otro medio idóneo). ` +
          `Cada pago a tiempo construye el Trust Score del arrendatario conforme al modelo Llave.`,
      };
    }
    return c;
  });
}

export function buildContractDraft(input: ContractDraftInput): ContractDraft {
  const start = input.startDate;
  const end = addMonths(start, input.monthsTotal);
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `contract-${crypto.randomUUID().slice(0, 12)}`
      : `contract-${Math.random().toString(36).slice(2, 14)}`;

  return {
    id,
    parties: {
      owner: input.owner,
      tenant: input.tenant,
      asesor: input.asesor ?? null,
    },
    property: toPropertyRef(input.property),
    terms: {
      monthly_amount: input.monthlyAmount,
      currency: input.currency,
      months_total: input.monthsTotal,
      start_date: start,
      end_date: end,
      deposit_months_lrcav: input.depositMonths,
      deposit_charged_to_tenant: 0,
      payment_due_day: 5,
    },
    clauses: personalizeClauses(input),
    signatures: [
      {
        role: "propietario",
        name: input.owner.full_name,
        cedula: input.owner.cedula,
        signed_at: null,
      },
      {
        role: "inquilino",
        name: input.tenant.full_name,
        cedula: input.tenant.cedula,
        signed_at: null,
      },
      ...(input.asesor
        ? [
            {
              role: "asesor" as const,
              name: input.asesor.full_name,
              cedula: input.asesor.cedula,
              signed_at: null,
            },
          ]
        : []),
    ],
    generated_at: new Date().toISOString(),
  };
}
