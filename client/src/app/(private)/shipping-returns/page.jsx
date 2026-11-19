"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import FilterBar from "@/components/common/FilterBar";
import DataTable from "@/components/common/DataTable";
import RecordCardView from "@/components/common/RecordCardView";
import CardViewToggle from "@/components/common/CardViewToggle";
import StatusChip from "@/components/common/StatusChip";
import ReturnInspectionDialog from "@/features/shipping-returns/ReturnInspectionDialog";
import EditShipmentDialog from "@/features/shipping-returns/EditShipmentDialog";
import ReturnFormDialog from "@/features/shipping-returns/ReturnFormDialog";
import RtoFormDialog from "@/features/shipping-returns/RtoFormDialog";
import {
  updateShipmentStatus,
  editShipment,
  addCustomerReturn,
  editCustomerReturn,
  updateReturnInspection,
  addRtoRecord,
  editRtoRecord,
  updateRtoStatus,
} from "@/store/slices/shippingReturnsSlice";
import { adjustStock } from "@/store/slices/productsSlice";
import { addMovement } from "@/store/slices/inventorySlice";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { exportToCsv } from "@/lib/exportCsv";

// MUI
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RateReviewIcon from "@mui/icons-material/RateReview";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

export default function ShippingReturnsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { shipments, returns, rtos } = useSelector((state) => state.shippingReturns);
  const products = useSelector((state) => state.products.items);
  // Merge returned orders from the orders slice into the Customer Returns tab
  const orders = useSelector((state) => state.orders.items);
  const returnedOrdersAsReturns = orders
    .filter((o) => o.orderStatus === "Returned")
    .map((o) => ({
      id: `RET-ORD-${o.id}`,
      originalOrderId: o.id,
      marketplace: o.marketplace,
      productName: o.productName,
      sku: o.sku,
      customerName: o.customerName,
      returnReason: o.returnReason || "Returned by customer",
      returnDate: o.orderDate?.split("T")[0] || "",
      refundAmount: o.totalAmount || 0,
      inspectionStatus: "Pending Inspection",
      restockEligibility: "Pending Decision",
      returnStatus: "In Transit to Warehouse",
      restocked: false,
      inspectionNotes: "",
      reverseShippingFee: 0,
      _fromOrder: true,
    }));
  // Only add orders not already in the returns slice (avoid duplicates)
  const allReturns = [
    ...returns,
    ...returnedOrdersAsReturns.filter(
      (ro) => !returns.some((r) => r.originalOrderId === ro.originalOrderId)
    ),
  ];

  const [currentTab, setCurrentTab] = useState(0); // 0: Shipments, 1: Customer Returns, 2: RTO
  const [search, setSearch] = useState("");
  const [marketplaceFilter, setMarketplaceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  // Dialog states
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [editShipmentOpen, setEditShipmentOpen] = useState(false);

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [inspectionDialogOpen, setInspectionDialogOpen] = useState(false);
  const [returnFormOpen, setReturnFormOpen] = useState(false);
  const [editingReturn, setEditingReturn] = useState(null);

  const [rtoFormOpen, setRtoFormOpen] = useState(false);
  const [editingRto, setEditingRto] = useState(null);

  // Summary Metrics
  const summary = useMemo(() => {
    const inTransitShipments = shipments.filter(
      (s) => s.deliveryStatus === "In Transit" || s.deliveryStatus === "Out for Delivery"
    ).length;

    const deliveredShipments = shipments.filter(
      (s) => s.deliveryStatus.includes("Delivered")
    ).length;

    const totalRefunds = allReturns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
    const totalRtoCharges = rtos.reduce((sum, r) => sum + (r.returnShippingCharge || 0), 0);

    return {
      totalShipments: shipments.length,
      inTransitShipments,
      deliveredShipments,
      totalReturns: allReturns.length,
      totalRefunds,
      totalRtos: rtos.length,
      totalRtoCharges,
    };
  }, [shipments, returns, rtos]);

  // Filtered Shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.orderId.toLowerCase().includes(q) ||
        (s.awbNumber && s.awbNumber.toLowerCase().includes(q)) ||
        s.courierName.toLowerCase().includes(q) ||
        s.destinationCity.toLowerCase().includes(q);

      const matchesChannel =
        marketplaceFilter === "all" ||
        s.marketplace.toLowerCase() === marketplaceFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" || s.deliveryStatus === statusFilter;

      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [shipments, search, marketplaceFilter, statusFilter]);

  // Filtered Returns
  const filteredReturns = useMemo(() => {
    return allReturns.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.originalOrderId.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q);

      const matchesChannel =
        marketplaceFilter === "all" ||
        r.marketplace.toLowerCase() === marketplaceFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" || r.returnStatus === statusFilter;

      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [returns, search, marketplaceFilter, statusFilter]);

  // Filtered RTO
  const filteredRtos = useMemo(() => {
    return rtos.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.originalOrderId.toLowerCase().includes(q) ||
        r.courierName.toLowerCase().includes(q) ||
        r.destinationCity.toLowerCase().includes(q);

      const matchesChannel =
        marketplaceFilter === "all" ||
        r.marketplace.toLowerCase() === marketplaceFilter.toLowerCase();

      return matchesSearch && matchesChannel;
    });
  }, [rtos, search, marketplaceFilter]);

  // Handlers for Shipments
  const handleOpenEditShipment = (shp) => {
    setSelectedShipment(shp);
    setEditShipmentOpen(true);
  };

  const handleEditShipmentSubmit = (payload) => {
    dispatch(editShipment(payload));
  };

  const handleQuickMarkDelivered = (shipmentId) => {
    dispatch(
      updateShipmentStatus({
        id: shipmentId,
        deliveryStatus: "Delivered",
      })
    );
  };

  // Handlers for Returns
  const handleOpenInspection = (record) => {
    setSelectedReturn(record);
    setInspectionDialogOpen(true);
  };

  const handleInspectionSubmit = (data) => {
    dispatch(updateReturnInspection(data));

    // If marked Eligible and not previously restocked, increment stock!
    if (data.restockEligibility === "Eligible") {
      const returnRec = returns.find((r) => r.id === data.id);
      if (returnRec && !returnRec.restocked) {
        const prod = products.find(
          (p) => p.sku === returnRec.sku || p.name === returnRec.productName
        );
        if (prod) {
          dispatch(adjustStock({ productId: prod.id, newStock: prod.stock + 1 }));
          dispatch(
            addMovement({
              productId: prod.id,
              productName: prod.name,
              sku: prod.sku,
              type: "Return Restock",
              quantity: 1,
              previousStock: prod.stock,
              newStock: prod.stock + 1,
              reason: `Customer return restocked after quality inspection (${data.id})`,
              referenceId: data.id,
            })
          );
        }
      }
    }
  };

  const handleReturnFormSubmit = (data) => {
    if (editingReturn) {
      dispatch(editCustomerReturn(data));
    } else {
      dispatch(addCustomerReturn(data));
    }
  };

  // Handlers for RTO
  const handleRtoFormSubmit = (data) => {
    if (editingRto) {
      dispatch(editRtoRecord(data));
    } else {
      dispatch(addRtoRecord(data));
    }
  };

  const handleMarkRtoReceived = (rto) => {
    dispatch(
      updateRtoStatus({
        id: rto.id,
        rtoStatus: "Received Back & Verified",
        receivedBackDate: new Date().toISOString().split("T")[0],
        notes: "Verified intact and restocked to inventory.",
      })
    );

    if (!rto.restocked) {
      const matchedProd = products[0];
      if (matchedProd) {
        dispatch(adjustStock({ productId: matchedProd.id, newStock: matchedProd.stock + 1 }));
        dispatch(
          addMovement({
            productId: matchedProd.id,
            productName: matchedProd.name,
            sku: matchedProd.sku,
            type: "Return Restock",
            quantity: 1,
            previousStock: matchedProd.stock,
            newStock: matchedProd.stock + 1,
            reason: `RTO delivery package verified & restocked (${rto.id})`,
            referenceId: rto.id,
          })
        );
      }
    }
  };

  const handleExport = () => {
    if (currentTab === 0) {
      const data = filteredShipments.map((s) => ({
        ShipmentID: s.id,
        OrderID: s.orderId,
        Marketplace: s.marketplace,
        Courier: s.courierName,
        AWB: s.awbNumber,
        ShipmentDate: s.shipmentDate,
        ExpectedDelivery: s.expectedDeliveryDate,
        DeliveryStatus: s.deliveryStatus,
        ShippingCost: s.shippingCost,
        Destination: s.destinationCity,
      }));
      exportToCsv("SellerDesk_Shipments", data);
    } else if (currentTab === 1) {
      const data = filteredReturns.map((r) => ({
        ReturnID: r.id,
        OrderID: r.originalOrderId,
        Marketplace: r.marketplace,
        Customer: r.customerName,
        Product: r.productName,
        SKU: r.sku,
        Reason: r.returnReason,
        ReturnDate: r.returnDate,
        RefundAmount: r.refundAmount,
        InspectionStatus: r.inspectionStatus,
        RestockEligibility: r.restockEligibility,
        ReturnStatus: r.returnStatus,
      }));
      exportToCsv("SellerDesk_Customer_Returns", data);
    } else {
      const data = filteredRtos.map((r) => ({
        RTO_ID: r.id,
        OrderID: r.originalOrderId,
        Marketplace: r.marketplace,
        Courier: r.courierName,
        AWB: r.awbNumber,
        Reason: r.rtoReason,
        Charge: r.returnShippingCharge,
        Status: r.rtoStatus,
        ReceivedDate: r.receivedBackDate || "Pending",
      }));
      exportToCsv("SellerDesk_RTO_Records", data);
    }
  };

  // Shipments Columns
  const shipmentColumns = [
    {
      key: "id",
      label: "Shipment ID",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-[11px] text-blue-600 font-medium">Order: {row.orderId}</div>
        </div>
      ),
    },
    {
      key: "marketplace",
      label: "Channel",
      sortable: true,
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: "courierName",
      label: "Courier & AWB",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-800">{val}</div>
          <div className="text-[11px] font-mono text-slate-500">{row.awbNumber || "Pending"}</div>
        </div>
      ),
    },
    {
      key: "destinationCity",
      label: "Destination",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="text-slate-800 font-medium">{val}</div>
          <div className="text-[10px] text-slate-400 font-mono">PIN: {row.pincode}</div>
        </div>
      ),
    },
    {
      key: "deliveryStatus",
      label: "Delivery Status",
      sortable: true,
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: "shippingCost",
      label: "Freight Cost",
      sortable: true,
      align: "right",
      render: (val) => <span className="font-bold text-slate-900">{formatCurrency(val)}</span>,
    },
    {
      key: "dates",
      label: "Dates",
      sortable: false,
      render: (_, row) => (
        <div className="text-xs text-slate-600">
          <div>Ship: {formatDate(row.shipmentDate)}</div>
          <div className="text-[10px] text-slate-400">ETA: {formatDate(row.expectedDeliveryDate)}</div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.deliveryStatus !== "Delivered" && !row.deliveryStatus.includes("Delivered") && (
            <button
              type="button"
              onClick={() => handleQuickMarkDelivered(row.id)}
              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition"
              title="Quick mark as delivered"
            >
              Delivered
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpenEditShipment(row)}
            className="p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
            title="Edit shipment & courier tracking"
          >
            <EditIcon sx={{ fontSize: 17 }} />
          </button>
        </div>
      ),
    },
  ];

  // Customer Returns Columns
  const returnColumns = [
    {
      key: "id",
      label: "Return ID",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            {val}
            {row._fromOrder && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                From Order
              </span>
            )}
          </div>
          <div className="text-[11px] text-blue-600">Order: {row.originalOrderId}</div>
        </div>
      ),
    },
    {
      key: "marketplace",
      label: "Channel",
      sortable: true,
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: "productName",
      label: "Product & Reason",
      sortable: true,
      render: (val, row) => (
        <div className="max-w-[220px]">
          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={val}>{val}</div>
          <div className="text-xs text-rose-600 font-medium italic mt-0.5">
            &quot;{row.returnReason}&quot;
          </div>
          <div className="text-[10px] text-slate-400">Customer: {row.customerName}</div>
        </div>
      ),
    },
    {
      key: "refundAmount",
      label: "Refund (₹)",
      sortable: true,
      align: "right",
      render: (val) => <span className="font-bold text-slate-900">{formatCurrency(val)}</span>,
    },
    {
      key: "inspectionStatus",
      label: "Quality Inspection",
      sortable: true,
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: "restockEligibility",
      label: "Restock Eligibility",
      sortable: true,
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: "returnStatus",
      label: "Return Status",
      sortable: true,
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleOpenInspection(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition"
          >
            <RateReviewIcon sx={{ fontSize: 16 }} />
            <span>Inspect</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingReturn(row);
              setReturnFormOpen(true);
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Edit Return Details"
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      ),
    },
  ];

  // RTO Columns
  const rtoColumns = [
    {
      key: "id",
      label: "RTO ID",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-[11px] text-blue-600">Order: {row.originalOrderId}</div>
        </div>
      ),
    },
    {
      key: "marketplace",
      label: "Channel",
      sortable: true,
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: "courierName",
      label: "Courier & AWB",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-800">{val}</div>
          <div className="text-[11px] font-mono text-slate-500">{row.awbNumber || "Pending"}</div>
        </div>
      ),
    },
    {
      key: "rtoReason",
      label: "RTO Reason & Customer",
      sortable: false,
      render: (val, row) => (
        <div className="max-w-[220px]">
          <div className="font-medium text-slate-800">{row.customerName || "Customer"} ({row.destinationCity || "Destination"})</div>
          <div className="text-xs text-amber-700 mt-0.5">{val}</div>
        </div>
      ),
    },
    {
      key: "returnShippingCharge",
      label: "Freight Loss",
      sortable: true,
      align: "right",
      render: (val) => (
        <span className="font-bold text-rose-600">-{formatCurrency(val)}</span>
      ),
    },
    {
      key: "rtoStatus",
      label: "RTO Status",
      sortable: true,
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.rtoStatus !== "Received Back & Verified" && (
            <button
              type="button"
              onClick={() => handleMarkRtoReceived(row)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition"
            >
              <CheckCircleIcon sx={{ fontSize: 16 }} />
              <span>Verify &amp; Restock</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setEditingRto(row);
              setRtoFormOpen(true);
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Edit RTO Record"
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping, Returns & RTO Management"
        subtitle="Forward shipments, courier tracking, reverse logistics, return quality inspections, and restock actions."
        breadcrumbs={[{ label: "Shipping & Returns" }]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              sx={{ borderColor: "var(--btn-neutral-border)", color: "var(--btn-neutral-text)" }}
            >
              Export {currentTab === 0 ? "Shipments" : currentTab === 1 ? "Returns" : "RTO"} CSV
            </Button>

            {currentTab === 1 && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingReturn(null);
                  setReturnFormOpen(true);
                }}
              >
                Log New Return
              </Button>
            )}

            {currentTab === 2 && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingRto(null);
                  setRtoFormOpen(true);
                }}
              >
                Log New RTO
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Shipments"
          value={summary.totalShipments}
          subtitle={`${summary.inTransitShipments} in transit`}
          icon={LocalShippingIcon}
          color="blue"
        />

        <StatCard
          title="Delivered Rate"
          value={`${Math.round((summary.deliveredShipments / (summary.totalShipments || 1)) * 100)}%`}
          subtitle={`${summary.deliveredShipments} fulfilled`}
          icon={CheckCircleIcon}
          color="emerald"
        />

        <StatCard
          title="Customer Returns"
          value={summary.totalReturns}
          subtitle={`${formatCurrency(summary.totalRefunds)} refunds`}
          icon={AssignmentReturnIcon}
          color="amber"
        />

        <StatCard
          title="RTO Freight Losses"
          value={formatCurrency(summary.totalRtoCharges)}
          subtitle={`${summary.totalRtos} failed deliveries`}
          icon={RotateLeftIcon}
          color="rose"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <Tabs
          value={currentTab}
          onChange={(_, val) => {
            setCurrentTab(val);
            setSearch("");
            setMarketplaceFilter("all");
            setStatusFilter("all");
          }}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
            },
          }}
        >
          <Tab label={`Forward Shipments (${shipments.length})`} />
          <Tab label={`Customer Returns (${allReturns.length})`} />
          <Tab label={`RTO - Return to Origin (${rtos.length})`} />
        </Tabs>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by ID, order, courier, destination..."
        filters={[
          {
            value: marketplaceFilter,
            onChange: setMarketplaceFilter,
            options: [
              { label: "All Channels", value: "all" },
              { label: "Meesho", value: "meesho" },
              { label: "Flipkart", value: "flipkart" },
            ],
          },
        ]}
        onReset={() => {
          setSearch("");
          setMarketplaceFilter("all");
          setStatusFilter("all");
        }}
      >
        <CardViewToggle value={viewMode} onChange={setViewMode} />
      </FilterBar>

      {/* Tab Panels */}
      {currentTab === 0 && (
        viewMode === "table" ? (
          <DataTable
            columns={shipmentColumns}
            data={filteredShipments}
            keyField="id"
            initialSortKey="id"
            initialSortDir="desc"
            defaultRowsPerPage={10}
            emptyMessage="No shipments found."
            onRowClick={(row) => router.push(`/shipping-returns/${row.id}`)}
          />
        ) : (
          <RecordCardView
            items={filteredShipments}
            columns={shipmentColumns}
            fields={["marketplace", "courierName", "destinationCity", "deliveryStatus", "shippingCost", "dates"]}
            title={(shipment) => shipment.id}
            subtitle={(shipment) => `Order ${shipment.orderId}`}
            onCardClick={(shipment) => router.push(`/shipping-returns/${shipment.id}`)}
            emptyMessage="No shipments found."
          />
        )
      )}

      {currentTab === 1 && (
        viewMode === "table" ? (
          <DataTable
            columns={returnColumns}
            data={filteredReturns}
            keyField="id"
            initialSortKey="id"
            initialSortDir="desc"
            defaultRowsPerPage={10}
            emptyMessage="No customer returns found."
            onRowClick={(row) => router.push(`/shipping-returns/${row.id}`)}
          />
        ) : (
          <RecordCardView
            items={filteredReturns}
            columns={returnColumns}
            fields={["marketplace", "productName", "refundAmount", "inspectionStatus", "restockEligibility", "returnStatus"]}
            title={(record) => record.id}
            subtitle={(record) => `${record.originalOrderId} · ${record.customerName}`}
            onCardClick={(record) => router.push(`/shipping-returns/${record.id}`)}
            emptyMessage="No customer returns found."
          />
        )
      )}

      {currentTab === 2 && (
        viewMode === "table" ? (
          <DataTable
            columns={rtoColumns}
            data={filteredRtos}
            keyField="id"
            initialSortKey="id"
            initialSortDir="desc"
            defaultRowsPerPage={10}
            emptyMessage="No RTO records found."
            onRowClick={(row) => router.push(`/shipping-returns/${row.id}`)}
          />
        ) : (
          <RecordCardView
            items={filteredRtos}
            columns={rtoColumns}
            fields={["marketplace", "courierName", "rtoReason", "returnShippingCharge", "rtoStatus"]}
            title={(record) => record.id}
            subtitle={(record) => `Order ${record.originalOrderId}`}
            onCardClick={(record) => router.push(`/shipping-returns/${record.id}`)}
            emptyMessage="No RTO records found."
          />
        )
      )}

      {/* Edit Shipment Dialog */}
      <EditShipmentDialog
        open={editShipmentOpen}
        shipment={selectedShipment}
        onClose={() => setEditShipmentOpen(false)}
        onSubmit={handleEditShipmentSubmit}
      />

      {/* Customer Return Form Dialog (Add / Edit) */}
      <ReturnFormDialog
        open={returnFormOpen}
        initialData={editingReturn}
        onClose={() => setReturnFormOpen(false)}
        onSubmit={handleReturnFormSubmit}
      />

      {/* Return Quality Inspection Dialog */}
      <ReturnInspectionDialog
        open={inspectionDialogOpen}
        returnRecord={selectedReturn}
        onClose={() => setInspectionDialogOpen(false)}
        onSubmit={handleInspectionSubmit}
      />

      {/* RTO Form Dialog (Add / Edit) */}
      <RtoFormDialog
        open={rtoFormOpen}
        initialData={editingRto}
        onClose={() => setRtoFormOpen(false)}
        onSubmit={handleRtoFormSubmit}
      />
    </div>
  );
}
