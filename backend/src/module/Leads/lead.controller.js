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
  getLeadById,
} from "./lead.model.js";

const createLeads = asyncHandler(async (req, res) => {
  const data = req.body;
  const city = data.city || "Unknown";

  console.log("request body", req.body);
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
const listLeads = asyncHandler(async (req, res) => {
  const user = req.user;
  const userCityIds = user.city_ids || [];

  // ✅ Sirf "Pre-Sales Executive" role ho tab presalesId pass karo
  const presalesId = user.role_name === "Pre-Sales Executive" ? user.id : null;

  const page = parseInt(req.query.page) || 1;
  const limit = 14;
  const search = req.query.search || "";
  const month = req.query.month || null;
  const year = req.query.year || null;

  const leadsData = await getLeads(
    page,
    limit,
    userCityIds,
    search,
    presalesId,
    month,
    year
  );

 
  res
    .status(200)
    .json(new ApiResponse(200, leadsData, "Leads fetched successfully"));
});

const updateLeadUnwantedStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { unwanted_status } = req.body;

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

const updateLeadByIdController = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const data = req.body;
  if (!leadId) {
    throw new ApiError(400, "Lead ID is required");
  }

  // Step 1: Get existing lead to find customer_id
  const existingLead = await getLeadById(leadId);
  if (!existingLead) {
    throw new ApiError(404, "Lead not found");
  }

  const customerId = existingLead.customer_id;

  // Step 2: Update customer if customer fields provided
  const customerFields = {
    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    companyName: data.companyName,
    customerType: data.customerType,
    customerCategoryType: data.customerCategoryType,
    address: data.address,
    state: data.state,
    alternatePhone: data.alternatePhone,
    countryName: data.countryName,
    customerCity: data.customerCity,
  };

  // Sirf wahi fields bhejo jo actually aaye hain request mein
  const customerUpdateData = Object.fromEntries(
    Object.entries(customerFields).filter(([_, v]) => v !== undefined),
  );

  let updatedCustomer = null;
  if (Object.keys(customerUpdateData).length > 0) {
    updatedCustomer = await updateCustomerById(customerId, customerUpdateData);
    if (!updatedCustomer) {
      throw new ApiError(400, "Customer could not be updated");
    }
  }

  // Step 3: Prepare lead update data — customer fields hata do
  const leadData = { ...data };
  delete leadData.firstName;
  delete leadData.middleName;
  delete leadData.lastName;
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

  // Step 4: Update lead if lead fields provided
  let updatedLead = null;
  if (Object.keys(leadData).length > 0) {
    updatedLead = await updateLeadById(leadId, leadData);
    if (!updatedLead) {
      throw new ApiError(400, "Lead could not be updated");
    }
  }

  // Step 5: Response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        customer: updatedCustomer,
        lead: updatedLead,
      },
      "Lead and customer updated successfully",
    ),
  );
});

export {
  createLeads,
  listLeads,
  updateLeadByIdController,
  updateLeadUnwantedStatusController,
};
