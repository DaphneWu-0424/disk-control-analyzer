import control as ct


def build_systems(Ka: float, K1: float):
    s = ct.TransferFunction.s

    # 电机线圈模型
    G1 = 5000 / (s + 1000)

    # 机械负载模型
    G2 = 1 / (s * (s + 20))

    # 位置 + 速度复合反馈
    H = 1 + K1 * s

    # 输入闭环传递函数
    # T_r(s) = P / (1 + P H), where P = Ka * G1 * G2
    P = Ka * G1 * G2
    sys_input = ct.feedback(P, H)

    # 扰动闭环传递函数
    # 若你的教材定义扰动方向相反，只要在这里前面加个负号即可
    sys_disturbance = ct.feedback(G2, Ka * G1 * H)

    return sys_input, sys_disturbance