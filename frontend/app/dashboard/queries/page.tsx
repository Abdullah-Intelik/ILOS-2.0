"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";


const mockQueries = [
    {
        id: "Q-001",
        applicant: "Ali Raza",
        caseRef: "APP-2024-0054",
        summary: "Missing CNIC front image",
        raisedBy: "CIU",
        date: "2025-06-24",
        status: "Pending",
        details: "The front image of CNIC is either missing or unreadable. Kindly re-upload.",
    },
    {
        id: "Q-002",
        applicant: "Maria Khan",
        caseRef: "APP-2024-0067",
        summary: "Income proof mismatch",
        raisedBy: "RUU",
        date: "2025-06-23",
        status: "Responded",
        details: "Submitted salary slip shows inconsistent amount. Clarify or update.",
    },
    // 10 new dummy queries below:
    {
        id: "Q-003",
        applicant: "Ahmed Shah",
        caseRef: "APP-2024-0078",
        summary: "Address mismatch in application",
        raisedBy: "CIU",
        date: "2025-06-22",
        status: "Pending",
        details: "The address on application does not match CNIC records.",
    },
    {
        id: "Q-004",
        applicant: "Sara Ali",
        caseRef: "APP-2024-0089",
        summary: "Signature inconsistency",
        raisedBy: "RUU",
        date: "2025-06-21",
        status: "Pending",
        details: "Signatures on documents differ from those on file.",
    },
    {
        id: "Q-005",
        applicant: "Bilal Ahmed",
        caseRef: "APP-2024-0095",
        summary: "Expired utility bill submitted",
        raisedBy: "CIU",
        date: "2025-06-20",
        status: "Responded",
        details: "Utility bill is expired; please submit latest copy.",
    },
    {
        id: "Q-006",
        applicant: "Nida Hassan",
        caseRef: "APP-2024-0102",
        summary: "Missing income proof for last 3 months",
        raisedBy: "RUU",
        date: "2025-06-19",
        status: "Pending",
        details: "Income proof for past 3 months is missing.",
    },
    {
        id: "Q-007",
        applicant: "Faisal Qureshi",
        caseRef: "APP-2024-0113",
        summary: "Incomplete bank statement",
        raisedBy: "CIU",
        date: "2025-06-18",
        status: "Responded",
        details: "Bank statement has missing pages, resubmit full statement.",
    },
    {
        id: "Q-008",
        applicant: "Zainab Malik",
        caseRef: "APP-2024-0120",
        summary: "Inconsistent employment details",
        raisedBy: "RUU",
        date: "2025-06-17",
        status: "Pending",
        details: "Employment details differ across submitted documents.",
    },
    {
        id: "Q-009",
        applicant: "Omar Farooq",
        caseRef: "APP-2024-0134",
        summary: "Duplicate CNIC number found",
        raisedBy: "CIU",
        date: "2025-06-16",
        status: "Pending",
        details: "CNIC number appears on multiple applications; verify identity.",
    },
    {
        id: "Q-010",
        applicant: "Ayesha Iqbal",
        caseRef: "APP-2024-0141",
        summary: "Missing co-applicant documents",
        raisedBy: "RUU",
        date: "2025-06-15",
        status: "Responded",
        details: "Documents for co-applicant not submitted; please upload ASAP.",
    },
    {
        id: "Q-011",
        applicant: "Hamza Siddiqui",
        caseRef: "APP-2024-0152",
        summary: "Incorrect loan amount requested",
        raisedBy: "CIU",
        date: "2025-06-14",
        status: "Pending",
        details: "Requested loan amount exceeds eligible limit, please correct.",
    },
    {
        id: "Q-012",
        applicant: "Sana Farhat",
        caseRef: "APP-2024-0160",
        summary: "Missing photograph on application",
        raisedBy: "RUU",
        date: "2025-06-13",
        status: "Pending",
        details: "Applicant photograph is missing or unclear on the submitted form.",
    },
];

export default function CIURUQueriesPage() {
    type Query = {
  id: string;
  applicant: string;
  caseRef: string;
  summary: string;
  raisedBy: string;
  date: string;
  status: string;
  details: string;
};

const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
    const [filter, setFilter] = useState("");
    const [tab, setTab] = useState("all");

    const filteredQueries = mockQueries.filter((q) => {
        const matchesFilter =
            q.applicant.toLowerCase().includes(filter.toLowerCase()) ||
            q.caseRef.toLowerCase().includes(filter.toLowerCase()) ||
            q.status.toLowerCase().includes(filter.toLowerCase());
        const matchesTab = tab === "all" || q.raisedBy.toLowerCase() === tab;
        return matchesFilter && matchesTab;
    });

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">CIU / RUU Queries</h1>

            <div className="flex items-center gap-4">
                <Label htmlFor="filter">Filter</Label>
                <Input id="filter" placeholder="Search by applicant, case ref, status..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-1/3" />
            </div>

            <Tabs value={tab} onValueChange={setTab} className="mt-4">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="ciu">CIU</TabsTrigger>
                    <TabsTrigger value="ruu">RUU</TabsTrigger>
                </TabsList>
            </Tabs>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Query ID</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Case Ref</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead>Raised By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredQueries.map((query) => (
                        <TableRow key={query.id}>
                            <TableCell>{query.id}</TableCell>
                            <TableCell>{query.applicant}</TableCell>
                            <TableCell>{query.caseRef}</TableCell>
                            <TableCell>{query.summary}</TableCell>
                            <TableCell>{query.raisedBy}</TableCell>
                            <TableCell>
                                <Badge variant={query.status === "Pending" ? "destructive" : "outline"}>{query.status}</Badge>
                            </TableCell>
                            <TableCell>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm" onClick={() => setSelectedQuery(query)}>View</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-xl">
                                        <DialogTitle>{query.summary}</DialogTitle>
                                        <DialogDescription className="mb-4">
                                            {query.details}
                                        </DialogDescription>

                                        <div className="space-y-2 mb-4">
                                            <Label>Response</Label>
                                            <Textarea placeholder="Type your response..." />
                                            <Label>Upload Corrected Document</Label>
                                            <Input type="file" />
                                        </div>

                                        <Button onClick={() => alert("Response submitted successfully")}>
                                            Submit Response
                                        </Button>
                                    </DialogContent>

                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
