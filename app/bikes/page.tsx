import { useState, useEffect } from "react";
import { redirect, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchBike, fetchBikeParts } from "@/utils/requests";
import Link from "next/link";
import Modal from "@/components/Modal";
import deletePart from "@/app/actions/deletePart";
import { NextResponse } from "next/server";
import addInstallation from "@/app/actions/addInstallation";

export default function BikesPage() {
  return <section className="bg-slate-50 pt-6">Schubidu!</section>;
}
