import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getLeads,
  insertLead,
  updateLeadById,
  updateCustomerById,
  updateLeadUnwantedStatus,
  getAllUnwantedLeadsModel,
  createCustomers,
} from "./lead.model.js";
// import { sendNotification } from "../../utils/sendNotification.js";

// const createLeads = asyncHandler(async (req, res) => {
//   const data = req.body;
//   console.log("data", data);
//   // Validate required fields (basic)

//   const newLead = await insertLead(data);

//   if (!newLead) {
//     throw new ApiError(400, "Lead could not be created");
//   }
//   // 🔔 Notification send
//   // await sendNotification(
//   //   "New Lead Created",
//   //   `New lead added: ${data.name}`
//   // );
//   res
//     .status(201)
//     .json(new ApiResponse(201, newLead, "Lead created successfully"));
// });

const createLeads = asyncHandler(async (req, res) => {
  const data = req.body;
  console.log(data);
  const city = data.city || "Unknown";
  console.log("Lead creation data:", data);

  // Basic validation
  if (!data.firstName || !data.customerPhone) {
    throw new ApiError(400, "Name, Phone are required");
  }

  // Step 1: Create customer or get existing customer
  const customerResult = await createCustomers({
    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    companyName: data.companyName,
    customerType: data.customerType,
    customerCategoryType: data.customerCategoryType,
    address: data.address,
    date_of_birth: data.date_of_birth,
    anniversary: data.anniversary,
    gender: data.gender,
    state: data.state,
    pincode: data.pincode,
    alternatePhone: data.alternatePhone,
    countryName: data.countryName,
    customerCity: data.customerCity || city,
  });

  if (!customerResult?.customerId) {
    throw new ApiError(400, "Customer could not be created or fetched");
  }

  // Step 2: Prepare lead data with customer_id
  const leadData = {
    ...data,
    city,
    customer_id: customerResult.customerId,
  };

  // Remove customer-only fields before lead insert
  delete leadData.customerName;
  delete leadData.customerPhone;
  delete leadData.customerEmail;
  delete leadData.companyName;
  delete leadData.customerType;
  delete leadData.customerCategoryType;
  delete leadData.address;
  delete leadData.date_of_birth;
  delete leadData.anniversary;
  delete leadData.gender;
  delete leadData.state;
  delete leadData.pincode;
  delete leadData.alternatePhone;
  delete leadData.countryName;
  delete leadData.customerCity;

  // Step 3: Insert lead
  const newLead = await insertLead(leadData);

  if (!newLead) {
    throw new ApiError(400, "Lead could not be created");
  }

  // Step 4: Final response
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        customer: {
          customerId: customerResult.customerId,
          uuid: customerResult.uuid,
          isExisting: customerResult.isExisting,
          message: customerResult.message,
        },
        lead: newLead,
      },
      "Lead created successfully",
    ),
  );
});

const updateLeadByIdController = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;

  if (!id) {
    throw new ApiError(400, null, "Lead ID is required");
  }

  // ── Customer fields alag karo ──────────────────────────────────────────
  const customerFields = {
    firstName: updateData.firstName,
    middleName: updateData.middleName,
    lastName: updateData.lastName,
    customerPhone: updateData.customerPhone,
    customerEmail: updateData.customerEmail,
    companyName: updateData.companyName,
    customerType: updateData.customerType,
    customerCategoryType: updateData.customerCategoryType,
    alternatePhone: updateData.alternatePhone,
    countryName: updateData.countryName,
    customerCity: updateData.customerCity,
    customerState: updateData.customerState,
    customerAddress: updateData.customerAddress,
  };

  // ── Lead fields se customer fields remove karo ─────────────────────────
  const leadFields = { ...updateData };
  Object.keys(customerFields).forEach((k) => delete leadFields[k]);
  delete leadFields.customer_id;

  // ── Customer table update karo ─────────────────────────────────────────
  if (updateData.customer_id) {
    await updateCustomerById(updateData.customer_id, customerFields);
  }

  // ── Lead table update karo ─────────────────────────────────────────────
  const updatedLead = await updateLeadById(id, leadFields);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedLead, "Lead updated successfully"));
});

const listLeads = asyncHandler(async (req, res) => {
  const user = req.user;
  const userCityIds = user.city_ids || [];

  const page = parseInt(req.query.page) || 1;
  const limit = 14;

  const leadsData = await getLeads(page, limit, userCityIds);
  console.log(leadsData);
  res
    .status(200)
    .json(new ApiResponse(200, leadsData, "Leads fetched successfully"));
});

const updateLeadUnwantedStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { unwanted_status } = req.body;
  console.log(id, unwanted_status);
  // validation
  if (!id || !unwanted_status) {
    throw new ApiError(400, "id and status are required");
  }

  if (!["wanted", "unwanted"].includes(unwanted_status)) {
    throw new ApiError(400, "Invalid status value");
  }

  // model call
  const result = await updateLeadUnwantedStatus(id, unwanted_status);

  if (result.affectedRows === 0) {
    throw new ApiError(404, "Lead not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Lead status updated successfully"));
});

export const getAllUnwantedLeadsController = asyncHandler(async (req, res) => {
  const leads = await getAllUnwantedLeadsModel();

  if (!leads || leads.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No unwanted leads found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, leads, "All unwanted leads fetched successfully"),
    );
});

export {
  createLeads,
  listLeads,
  updateLeadByIdController,
  updateLeadUnwantedStatusController,
};
