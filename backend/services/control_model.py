import control as ct


def _build_common_models():
    s = ct.TransferFunction.s

    # 电机线圈模型
    G1 = 5000 / (s + 1000)

    # 机械负载模型
    G2 = 1 / (s * (s + 20))
    return G1, G2


def build_position_only_systems(Ka: float):
    G1, G2 = _build_common_models()
    P = Ka * G1 * G2
    H = 1

    sys_input = ct.feedback(P, H)
    sys_disturbance = ct.feedback(G2, Ka * G1 * H)
    return sys_input, sys_disturbance


def build_position_velocity_systems(Ka: float, K1: float):
    G1, G2 = _build_common_models()
    s = ct.TransferFunction.s

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


def build_systems(Ka: float, K1: float, model_type: str):
    if model_type == "positionOnly":
        return build_position_only_systems(Ka)
    if model_type == "positionVelocity":
        return build_position_velocity_systems(Ka, K1)

    raise ValueError(f"Unsupported modelType: {model_type}")