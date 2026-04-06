import * as service from "../services/payroll.service";

export const createPayroll = async (c: any) => {
    const body = await c.req.json();

    const job = await service.createPayroll(body);

    return c.json(job);
};

export const getPayroll = async (c: any) => {
    const id = c.req.param("id");

    const job = await service.getPayroll(id);

    return c.json(job);
};
